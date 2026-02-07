import { Injectable, Logger } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
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
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/paymentInscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';

export type RegisterPaymentPixInput = {
  eventId: string;
  accountId?: string;
  guestName?: string;
  guestEmail?: string;
  isGuest: boolean;
  totalValue: number;
  image: string;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type RegisterPaymentPixOutput = {
  id: string;
  totalValue: number;
  status: StatusPayment;
  createdAt: Date;
};

@Injectable()
export class RegisterPaymentPixUsecase
  implements Usecase<RegisterPaymentPixInput, RegisterPaymentPixOutput>
{
  private readonly logger = new Logger(RegisterPaymentPixUsecase.name);
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

  async execute(
    input: RegisterPaymentPixInput,
  ): Promise<RegisterPaymentPixOutput> {
    // Validação do Evento
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `tentativa de registro de pagamento para o id: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterPaymentPixUsecase.name,
      );
    }

    const inscriptionIds = input.inscriptions.map((i) => i.id);

    const inscriptionsEntities =
      await this.inscriptionGateway.findManyByIds(inscriptionIds);

    // validação de quantidade (ID inválido)
    if (inscriptionsEntities.length !== inscriptionIds.length) {
      throw new InvalidInscriptionIdUsecaseException(
        'One or more inscription IDs are invalid',
        'Um ou mais IDs de inscrição são inválidos',
        RegisterPaymentPixUsecase.name,
      );
    }

    let totalDue = 0;

    for (const inscription of inscriptionsEntities) {
      if (inscription.getStatus() === InscriptionStatus.UNDER_REVIEW) {
        throw new InscriptionNotReleasedForPaymentUsecaseException(
          `Attempted payment before inscription release id: ${inscription.getId()}`,
          'O pagamento ainda não está liberado para esta inscrição.',
          RegisterPaymentPixUsecase.name,
        );
      }

      const remainingDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      totalDue += remainingDebt;
    }

    if (input.totalValue > totalDue) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed (${input.totalValue}) exceeds the debt amount (${totalDue})`,
        `O valor passado é maior que a dívida`,
        RegisterPaymentPixUsecase.name,
      );
    }

    if (!input.image) {
      throw new InvalidImageFormatUsecaseException(
        'Payment proof image is required',
        'A imagem do comprovante é obrigatória',
        RegisterPaymentPixUsecase.name,
      );
    }

    // Processamento da imagem
    const imagePath = await this.processEventImage(
      input.image,
      event.getId(),
      input.totalValue,
      input.isGuest,
      input.accountId,
      input.guestName,
    );

    // Criação do pagamento
    const payment = Payment.create({
      eventId: event.getId(),
      accountId: input.accountId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      isGuest: input.isGuest,
      status: StatusPayment.UNDER_REVIEW,
      totalValue: input.totalValue,
      totalPaid: 0,
      installment: 1,
      methodPayment: PaymentMethod.PIX,
      imageUrl: imagePath,
    });

    await this.paymentGateway.create(payment);

    // Alocação do valor + incremento do totalPaid
    let remainingValue = input.totalValue;
    const allocations: PaymentAllocation[] = [];
    const increments: { inscriptionId: string; value: number }[] = [];

    for (const inscription of inscriptionsEntities) {
      const remainingInscriptionDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      const allocationValue = Math.min(
        remainingInscriptionDebt,
        remainingValue,
      );

      if (allocationValue > 0) {
        allocations.push(
          PaymentAllocation.create({
            paymentId: payment.getId(),
            inscriptionId: inscription.getId(),
            value: allocationValue,
          }),
        );

        increments.push({
          inscriptionId: inscription.getId(),
          value: allocationValue,
        });

        remainingValue -= allocationValue;
        if (remainingValue <= 0) break;
      }
    }

    // Criação das alocações
    await this.paymentAllocationGateway.createMany(allocations);
    await this.inscriptionGateway.incrementTotalPaidMany(increments);

    // Notificação aos responsáveis do evento (opcional)
    if (inscriptionsEntities.length > 0) {
      void this.notifyEventResponsiblesAboutPayment(
        payment,
        inscriptionsEntities,
      ).catch((error) => {
        this.logger.error(
          `(BG) Erro ao enviar email de pagamento ${payment.getId()}: ${error.message}`,
          error,
        );
      });
    }

    const output: RegisterPaymentPixOutput = {
      id: payment.getId(),
      totalValue: payment.getTotalValue(),
      status: payment.getStatus(),
      createdAt: payment.getCreatedAt(),
    };

    return output;
  }

  private async notifyEventResponsiblesAboutPayment(
    payment: Payment,
    inscriptions: Inscription[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de e-mail de notificação de pagamento ${payment.getId()} para o evento ${payment.getEventId()}`,
      );
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

      const accountId = payment.getAccountId();
      const guestEmail = payment.getGuestEmail();

      if (!accountId && !guestEmail) {
        this.logger.warn(
          `Pagamento ${payment.getId()} não possui um ID de conta ou email de convidado associado para envio de e-mail de notificação`,
        );
        return;
      }

      let accountUsername = 'Convidado';
      if (accountId) {
        const accountUser = await this.userGateway.findById(accountId);
        accountUsername = accountUser?.getUsername() || 'Usuário desconhecido';
      } else if (guestEmail) {
        accountUsername = payment.getGuestName() || guestEmail;
      }

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
          paymentMethod: PaymentMethod.PIX,
          accountUsername: accountUsername,
          inscriptions: inscriptionsData,
        },
        responsibles,
      );
      this.logger.log(
        `E-mail de notificação de pagamento ${payment.getId()} enviado para ${responsibles.length} responsáveis do evento ${payment.getEventId()}`,
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
        RegisterPaymentPixUsecase.name,
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

    // Busca o nome do evento para incluir no nome do arquivo
    const eventName = await this.eventGateway.findById(eventId);

    let accountName;
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
