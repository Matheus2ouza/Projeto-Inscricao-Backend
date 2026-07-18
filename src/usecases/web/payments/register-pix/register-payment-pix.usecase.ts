import { Injectable, Logger } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { Event } from 'src/domain/entities/event/event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { PaymentProcessedNotificationEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-processed-notification-email.handler';
import { PaymentReviewNotificationEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-review-notification-email.handler';
import { PaymentProcessedNotificationEmailData } from 'src/infra/services/mail/types/payment/payment-processed-notification-email.types';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/payment-Inscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/payment/invalid-input.exception.usecase.exception';

export type RegisterPaymentPixInput = {
  eventId: string;
  accountId: string;
  name: string;
  email: string;
  value: number;
  date: string;
  file: File;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type File = {
  buffer: Buffer;
  mimeType: string;
};

export type RegisterPaymentPixOutput = {
  id: string;
  status: StatusPayment;
  confirmationCode?: string;
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
    private readonly paymentProcessedNotificationEmailHandler: PaymentProcessedNotificationEmailHandler,
    private readonly prisma: PrismaService,
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

    if (input.value > totalDue) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed (${input.value}) exceeds the debt amount (${totalDue})`,
        `O valor passado é maior que a dívida`,
        RegisterPaymentPixUsecase.name,
      );
    }

    if (!input.file) {
      throw new InvalidImageFormatUsecaseException(
        'Tentativa de registrar um pagamento sem enviar o comprovante',
        'O comprovante de pagamento é obrigatório',
        RegisterPaymentPixUsecase.name,
      );
    }

    if (!input.name || !input.email) {
      throw new InvalidInputUsecaseException(
        `Tentativa de registrar um pagamento mas não foi enviado todos os dados necessários para processar o pagamento, NAME: ${input.name}, email: ${input.email}`,
        'O nome do pagador é obrigatório',
        RegisterPaymentPixUsecase.name,
      );
    }

    // Processamento da imagem
    const imagePath = await this.processReceiptImage(
      input.file,
      event,
      input.value,
      input.name,
    );

    // Criação do pagamento
    const payment = Payment.create({
      eventId: event.getId(),
      accountId: input.accountId,
      guestName: input.name,
      guestEmail: input.email,
      isGuest: false,
      status: StatusPayment.UNDER_REVIEW,
      totalValue: input.value,
      totalPaid: 0,
      totalReceived: 0,
      installment: 1,
      methodPayment: PaymentMethod.PIX,
      imageUrls: [imagePath],
    });

    await this.paymentGateway.create(payment);

    // Alocação do valor + incremento do totalPaid
    let remainingValue = input.value;
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
        event,
        payment,
        inscriptionsEntities,
      ).catch((error) => {
        this.logger.error(
          `(BG) Erro ao enviar email de pagamento ${payment.getId()}: ${error.message}`,
          error,
        );
      });
    }
    // Notificação de pagamento processado com sucesso
    void this.notifyPaymentProcessed(event, payment, inscriptionsEntities);

    const output: RegisterPaymentPixOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
      confirmationCode: inscriptionsEntities[0].getConfirmationCode(),
    };

    return output;
  }

  private async processReceiptImage(
    file: File,
    event: Event,
    value: number,
    name: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do registro de pagamento');

    try {
      // extrai extensão a partir do mimeType
      const extension = file.mimeType.split('/')[1] ?? 'png';
      const buffer = file.buffer;

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
          maxFileSize: 300 * 1024,
        },
      );

      // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
      const sanitizedEventName = sanitizeFileName(event.getName());

      // Sanitiza o nome do pagador para evitar caracteres inválidos no Supabase
      const sanitizedName = sanitizeFileName(name);

      // Cria nome do arquivo: payment+valor+hora formatada
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
      const fileName = `payment_${sanitizedName}_${value}_${formattedDateTime}.${optimizedImage.format}`;

      // Define o nome da pasta com base no tipo de usuário (guest ou normal)
      const folderName = `payments/${sanitizedEventName}/normal/${sanitizedName}`;

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
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao processar logo do evento: ${err.message}`);

      if (error instanceof InvalidImageFormatUsecaseException) {
        throw error;
      }

      throw new InvalidImageFormatUsecaseException(
        `Falha ao tentar processar a imagem; ${err.message}`,
        'Falha ao tentar processar o comprovante',
        RegisterPaymentPixUsecase.name,
      );
    }
  }

  private async notifyEventResponsiblesAboutPayment(
    event: Event,
    payment: Payment,
    inscriptions: Inscription[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de e-mail de notificação de pagamento ${payment.getId()} para o evento ${payment.getEventId()}`,
      );

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

      // Preparar dados da inscrição para o email (agora é uma única inscrição)
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
    } catch (error: any) {
      this.logger.error(
        `Erro ao notificar responsáveis sobre novo pagamento: ${error.message}`,
        error.stack,
      );
    }
  }

  private async notifyPaymentProcessed(
    event: Event,
    payment: Payment,
    inscriptions: Inscription[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de e-mail de pagamento processado com sucesso ${payment.getId()} para o evento ${payment.getEventId()}`,
      );
      const APP_URL = process.env.APP_URL;

      let redirectionUrl: string | null = null;
      if (!APP_URL) {
        this.logger.warn(
          `Variável de ambiente não definida, seguindo sem a redirection url`,
        );
      }

      if (APP_URL) {
        const url = new URL(`${APP_URL}/user/payment/${event.getId()}`);
        redirectionUrl = url.toString();
      }

      const paymentData: PaymentProcessedNotificationEmailData = {
        paymentId: payment.getId(),
        name: payment.getGuestName()!,
        value: payment.getTotalValue(),
        email: payment.getGuestEmail()!,
        createdAt: payment.getCreatedAt(),
        paymentMethod: payment.getMethodPayment(),
      };

      await this.paymentProcessedNotificationEmailHandler.sendPaymentProcessedNotification(
        event.getName(),
        paymentData,
        redirectionUrl,
      );

      this.logger.log(
        `E-mail de pagamento processado ${payment.getId()} enviado com sucesso para ${paymentData.email}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Erro ao notificar pagamento processado ${payment.getId()}: ${error.message}`,
        error.stack,
      );
    }
  }
}
