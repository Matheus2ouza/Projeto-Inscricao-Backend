import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { StatusPayment } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { PaymentReviewNotificationEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-review-notification-email.handler';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/events/invalid-image-format.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { MissingInscriptionIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/missing-inscription-id.usecase.exception';
import { OverpaymentNotAllowedUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';

export type CreatePaymentInput = {
  inscriptionId: string;
  accountId: string;
  value: number;
  image: string;
};

export type CreatePaymentOutput = {
  id: string;
};

@Injectable()
export class CreatePaymentInscriptionUsecase
  implements Usecase<CreatePaymentInput, CreatePaymentOutput>
{
  private readonly logger = new Logger(CreatePaymentInscriptionUsecase.name);
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
    private readonly paymentReviewNotificationEmailHandler: PaymentReviewNotificationEmailHandler,
  ) {}

  public async execute({
    inscriptionId,
    accountId,
    value,
    image,
  }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    //Validações das inscrições
    if (!inscriptionId) {
      throw new MissingInscriptionIdUsecaseException(
        `attempt to register payment without InscriptionId: ${inscriptionId}`,
        `ID da Inscrição não informado`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    const inscription = await this.inscriptionGateway.findById(inscriptionId);

    if (!inscription) {
      throw new InvalidInscriptionIdUsecaseException(
        `attempt to register a payment but the inscriptionId does not refer to any inscription: ${inscriptionId}`,
        `ID da inscrição é invalido`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    if (inscription.getStatus() === 'UNDER_REVIEW') {
      throw new InscriptionNotReleasedForPaymentUsecaseException(
        `Attempted payment before inscription release id: ${inscriptionId}, status: ${inscription.getStatus()}`,
        'O pagamento ainda não está liberado para esta inscrição.',
        CreatePaymentInscriptionUsecase.name,
      );
    }

    const currentDebt = inscription.getTotalValue();

    if (new Decimal(value).greaterThan(currentDebt)) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed was greater than the amount of the debt: ${value}, inscriptionId: ${inscriptionId}`,
        `O valor passado é maior que a dívida`,
        CreatePaymentInscriptionUsecase.name,
      );
    }

    if (!image) {
      throw new InvalidImageFormatUsecaseException(
        'Payment proof image is required',
        'A imagem do comprovante é obrigatória',
        CreatePaymentInscriptionUsecase.name,
      );
    }

    const status: StatusPayment = 'UNDER_REVIEW';
    const eventId = inscription.getEventId();
    const imageUrl = await this.processEventImage(
      image,
      eventId,
      inscription.getId(),
      value,
    );

    const paymentInscription = PaymentInscription.create({
      inscriptionId: inscriptionId,
      eventId: eventId,
      accountId: accountId,
      status: status,
      value: Decimal(value),
      imageUrl: imageUrl,
    });

    await this.paymentInscriptionGateway.create(paymentInscription);

    await this.notifyEventResponsiblesAboutPayment(
      paymentInscription,
      inscription,
    );

    const output: CreatePaymentOutput = {
      id: paymentInscription.getId(),
    };
    return output;
  }

  private async notifyEventResponsiblesAboutPayment(
    paymentInscription: PaymentInscription,
    inscription: Inscription,
  ): Promise<void> {
    try {
      const event = await this.eventGateway.findById(
        paymentInscription.getEventId(),
      );

      if (!event) {
        this.logger.warn(
          `Evento ${paymentInscription.getEventId()} não encontrado ao tentar enviar notificação de pagamento.`,
        );
        return;
      }

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(
          paymentInscription.getEventId(),
        );

      if (eventResponsibles.length === 0) {
        this.logger.warn(
          `Evento ${paymentInscription.getEventId()} não possui responsáveis cadastrados para notificação de pagamento.`,
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

      const accountUser = await this.userGateway.findById(
        paymentInscription.getAccountId(),
      );

      await this.paymentReviewNotificationEmailHandler.sendNewPaymentNotification(
        {
          paymentId: paymentInscription.getId(),
          inscriptionId: inscription.getId(),
          eventName: event.getName(),
          eventLocation: event.getLocation(),
          eventStartDate: event.getStartDate(),
          eventEndDate: event.getEndDate(),
          paymentValue: paymentInscription.getValue().toNumber(),
          paymentDate: paymentInscription.getCreatedAt(),
          payerName: inscription.getResponsible(),
          payerEmail: inscription.getEmail(),
          payerPhone: inscription.getPhone(),
          accountUsername: accountUser?.getUsername(),
        },
        responsibles,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao notificar responsáveis sobre novo pagamento: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processEventImage(
    image: string,
    eventId: string,
    inscriptionId: string,
    value: number,
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
        CreatePaymentInscriptionUsecase.name,
      );
    }

    // Otimiza imagem (ex: converte para webp e reduz tamanho)
    const optimizedImage = await this.imageOptimizerService.optimizeImage(
      buffer,
      {
        maxWidth: 800,
        maxHeight: 800,
        quality: 70,
        format: 'webp',
        maxFileSize: 300 * 1024, // 300KB
      },
    );

    const eventName = await this.eventGateway.findById(eventId);

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(
      eventName?.getName() || 'evento',
    );

    // Cria nome do arquivo: payment+valor+hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `payment_${inscriptionId}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: `payments/${sanitizedEventName}`,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
