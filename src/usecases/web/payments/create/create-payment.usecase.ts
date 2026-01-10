import { Injectable, Logger } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { PaymentReviewNotificationEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-review-notification-email.handler';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/events/invalid-image-format.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/paymentInscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';

export type CreatePaymentInput = {
  eventId: string;
  accountId: string;
  totalValue: number;
  image: string;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type CreatePaymentOutput = {
  id: string;
};

@Injectable()
export class CreatePaymentUsecase
  implements Usecase<CreatePaymentInput, CreatePaymentOutput>
{
  private readonly logger = new Logger(CreatePaymentUsecase.name);
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
    private readonly paymentReviewNotificationEmailHandler: PaymentReviewNotificationEmailHandler,
  ) {}

  async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    // Validação do Evento
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `tentativa de registro de pagamento para o id: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        CreatePaymentUsecase.name,
      );
    }

    let totalDue = 0;
    const inscriptionsEntities: Inscription[] = [];

    // Validação das inscrições e cálculo do totalDue
    for (const insc of input.inscriptions) {
      const inscription = await this.inscriptionGateway.findById(insc.id);

      if (!inscription) {
        throw new InvalidInscriptionIdUsecaseException(
          `attempt to register a payment but the inscriptionId does not refer to any inscription: ${insc.id}`,
          `ID da inscrição é invalido`,
          CreatePaymentUsecase.name,
        );
      }

      if (inscription.getStatus() === StatusPayment.UNDER_REVIEW) {
        throw new InscriptionNotReleasedForPaymentUsecaseException(
          `Attempted payment before inscription release id: ${inscription.getId()}, status: ${inscription.getStatus()}`,
          'O pagamento ainda não está liberado para esta inscrição.',
          CreatePaymentUsecase.name,
        );
      }

      totalDue += inscription.getTotalValue();
      inscriptionsEntities.push(inscription);
    }

    if (input.totalValue > totalDue) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed (${input.totalValue}) exceeds the debt amount (${totalDue})`,
        `O valor passado é maior que a dívida`,
        CreatePaymentUsecase.name,
      );
    }

    if (!input.image) {
      throw new InvalidImageFormatUsecaseException(
        'Payment proof image is required',
        'A imagem do comprovante é obrigatória',
        CreatePaymentUsecase.name,
      );
    }

    // Processamento da imagem
    const imagePath = await this.processEventImage(
      input.image,
      event.getId(),
      input.accountId,
      input.totalValue,
    );

    // Criação do pagamento
    const payment = Payment.create({
      eventId: event.getId(),
      accountId: input.accountId,
      status: StatusPayment.UNDER_REVIEW,
      totalValue: input.totalValue,
      imageUrl: imagePath,
    });

    await this.paymentGateway.create(payment);

    // Alocação do valor para as inscrições na ordem enviada pelo front
    let remainingValue = input.totalValue;
    for (const inscription of inscriptionsEntities) {
      const allocationValue = Math.min(
        inscription.getTotalValue(),
        remainingValue,
      );

      const paymentAllocation = PaymentAllocation.create({
        paymentId: payment.getId(),
        inscriptionId: inscription.getId(),
        value: allocationValue,
      });

      await this.paymentAllocationGateway.create(paymentAllocation);

      remainingValue -= allocationValue;
      if (remainingValue <= 0) break; // Para se o valor total já tiver sido alocado
    }

    // Notificação aos responsáveis do evento (opcional)
    if (inscriptionsEntities.length > 0) {
      await this.notifyEventResponsiblesAboutPayment(
        payment,
        inscriptionsEntities,
      );
    }

    const output: CreatePaymentOutput = {
      id: payment.getId(),
    };

    return output;
  }

  private async notifyEventResponsiblesAboutPayment(
    payment: Payment,
    inscriptions: Inscription[],
  ): Promise<void> {
    try {
      const event = await this.eventGateway.findById(payment.getEventId());

      if (!event) {
        this.logger.warn(
          `Evento ${payment.getEventId()} não encontrado ao tentar enviar notificação de pagamento.`,
        );
        return;
      }

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(payment.getEventId());

      if (eventResponsibles.length === 0) {
        this.logger.warn(
          `Evento ${payment.getEventId()} não possui responsáveis cadastrados para notificação de pagamento.`,
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
        payment.getAccountId(),
      );

      // Preparar dados das inscrições para o email
      const inscriptionsData = inscriptions.map((inscription) => ({
        inscriptionId: inscription.getId(),
        payerName: inscription.getResponsible(),
        payerEmail: inscription.getEmail(),
        payerPhone: inscription.getPhone(),
        totalValue: inscription.getTotalValue(),
      }));

      await this.paymentReviewNotificationEmailHandler.sendNewPaymentNotification(
        {
          paymentId: payment.getId(),
          eventName: event.getName(),
          eventLocation: event.getLocation(),
          eventStartDate: event.getStartDate(),
          eventEndDate: event.getEndDate(),
          paymentValue: payment.getTotalValue(),
          paymentDate: payment.getCreatedAt(),
          accountUsername: accountUser?.getUsername(),
          inscriptions: inscriptionsData,
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
    accountId: string,
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
        CreatePaymentUsecase.name,
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
    const fileName = `payment_${accountId}_${value}_${formattedDateTime}.${optimizedImage.format}`;

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
