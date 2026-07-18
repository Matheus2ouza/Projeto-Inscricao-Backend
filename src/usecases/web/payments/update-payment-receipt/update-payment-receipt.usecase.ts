import { Injectable, Logger } from '@nestjs/common';
import { Account } from 'src/domain/entities/account/account.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { PaymentReceiptUpdateEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-receipt-update-email.handler';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type UpdatePaymentReceiptInput = {
  paymentId: string;
  user?: UserInfoType;
  isGuest: boolean;
  image: string;
};

export type UpdatePaymentReceiptOutput = {
  paymentId: string;
  imageUrls: string[];
};

@Injectable()
export class UpdatePaymentReceiptUsecase
  implements Usecase<UpdatePaymentReceiptInput, UpdatePaymentReceiptOutput>
{
  private readonly logger = new Logger(UpdatePaymentReceiptUsecase.name);
  public constructor(
    private readonly userGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly paymentReceiptUpdateEmailHandler: PaymentReceiptUpdateEmailHandler,
  ) {}

  async execute(
    input: UpdatePaymentReceiptInput,
  ): Promise<UpdatePaymentReceiptOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `attempt to update payment receipt for payment: ${input.paymentId} but it was not found`,
        'Pagamento não encontrado',
        UpdatePaymentReceiptUsecase.name,
      );
    }

    const oldImagePaths = payment.getImageUrls(); // Agora é string[]

    const imagePath = await this.processEventImage(
      input.image,
      payment.getEventId(),
      payment.getTotalValue(),
      payment.getIsGuest()!,
      payment.getAccountId(),
      payment.getGuestName(),
    );

    // Upload bem-sucedido — deleta as imagens antigas se existirem
    if (oldImagePaths && oldImagePaths.length > 0) {
      try {
        await this.supabaseStorageService.deleteFiles(oldImagePaths);
        this.logger.log(
          `${oldImagePaths.length} imagem(ns) antiga(s) deletada(s): ${oldImagePaths.join(', ')}`,
        );
      } catch (error: any) {
        // Não bloqueia o fluxo se falhar ao deletar as antigas
        this.logger.warn(
          `Falha ao deletar imagem(ns) antiga(s) (${oldImagePaths.join(', ')}): ${error.message}`,
        );
      }
    }

    payment.updateImage(imagePath);
    await this.paymentGateway.update(payment);

    await this.notifyEventResponsiblesAboutPaymentReceiptUpdate(payment);

    const output: UpdatePaymentReceiptOutput = {
      paymentId: payment.getId(),
      imageUrls: payment.getImageUrls()!,
    };

    return output;
  }

  private async notifyEventResponsiblesAboutPaymentReceiptUpdate(
    payment: Payment,
  ): Promise<void> {
    try {
      const event = await this.eventGateway.findById(payment.getEventId());

      if (!event) {
        this.logger.warn(
          `Evento ${payment.getEventId()} não encontrado ao tentar enviar notificação de comprovante atualizado.`,
        );
        return;
      }

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(payment.getEventId());

      if (eventResponsibles.length === 0) {
        this.logger.warn(
          `Evento ${payment.getEventId()} não possui responsáveis cadastrados para notificação de comprovante atualizado.`,
        );
        return;
      }

      const responsibles = await Promise.all(
        eventResponsibles.map(async (responsible) => {
          const user = await this.userGateway.findById(
            responsible.getAccountId(),
          );
          return {
            id: responsible.getAccountId(),
            username: user?.getUsername() || 'Usuário não encontrado',
            email: user?.getEmail(),
          };
        }),
      );

      const imageUrls = payment.getImageUrls();
      if (!imageUrls || imageUrls.length === 0) {
        this.logger.warn(
          `Pagamento ${payment.getId()} não possui imagens para notificação de comprovante atualizado.`,
        );
        return;
      }

      // Para o email, pode pegar a primeira imagem ou todas
      const firstImageUrl = imageUrls[0];

      await this.paymentReceiptUpdateEmailHandler.sendNewPaymentReceiptUpdate(
        {
          paymentId: payment.getId(),
          imageUrl: firstImageUrl,
          eventName: event.getName(),
        },
        responsibles,
      );
    } catch (error: any) {
      this.logger.error(
        `Erro ao notificar responsáveis sobre comprovante atualizado: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processEventImage(
    image: string,
    eventId: string,
    value: number,
    isGuest: boolean,
    accountId?: string,
    guestName?: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Valida a imagem
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      `payment_${value}.${extension}`,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        UpdatePaymentReceiptUsecase.name,
      );
    }

    const MAX_SIZE_WITHOUT_OPTIMIZATION = 200 * 1024; // 200KB
    const needsOptimization = buffer.length > MAX_SIZE_WITHOUT_OPTIMIZATION;

    this.logger.log(
      `Tamanho da imagem: ${(buffer.length / 1024).toFixed(1)}KB — ${needsOptimization ? 'otimização necessária' : 'otimização ignorada'}`,
    );

    // Caso tenha mais que o tamanho maximo permitido entao otimiza o tamanho (tamanho maximo permitido: 200KB)
    const optimizedImage = needsOptimization
      ? await this.imageOptimizerService.optimizeImage(buffer, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 70,
          format: 'webp',
          maxFileSize: 300 * 1024,
        })
      : { buffer, format: extension };

    // Busca o nome do evento para incluir no nome do arquivo
    const eventName = await this.eventGateway.findById(eventId);

    let accountName: Account | null = null;
    if (!isGuest && accountId) {
      //Busca o nome da conta para incluir no nome do arquivo
      accountName = await this.userGateway.findById(accountId);
    }

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(
      eventName?.getName() || 'evento',
    );

    // Sanitiza o nome da conta para evitar caracteres inválidos no Supabase
    const sanitizedName = sanitizeFileName(
      guestName || accountName?.getUsername() || 'conta',
    );

    // Cria nome do arquivo: payment+valor+hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `payment_${accountId || sanitizedName}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Define o nome da pasta com base no tipo de usuário (guest ou normal)
    const folderName = isGuest
      ? `payments/${sanitizedEventName}/guest/${sanitizedName}`
      : `payments/${sanitizedEventName}/normal/${sanitizedName}`;

    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: folderName,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
