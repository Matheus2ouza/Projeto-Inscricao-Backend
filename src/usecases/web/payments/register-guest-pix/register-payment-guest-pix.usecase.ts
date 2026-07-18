import { Injectable, Logger } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  PaymentMode,
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
import { PaymentModeNotAllowedUsecaseException } from '../../exceptions/events/payment-mode-not-allowed.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/payment-Inscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/payment/invalid-input.exception.usecase.exception';

export type RegisterPaymentGuestPixInput = {
  inscriptionId: string;
  name: string;
  email: string;
  value: number;
  date: string;
  file: File;
};

export type File = {
  buffer: Buffer;
  mimeType: string;
};

export type RegisterPaymentGuestPixOutput = {
  id: string;
  status: StatusPayment;
  confirmationCode?: string;
};

@Injectable()
export class RegisterPaymentGuestPixUsecase
  implements
    Usecase<RegisterPaymentGuestPixInput, RegisterPaymentGuestPixOutput>
{
  private readonly logger = new Logger(RegisterPaymentGuestPixUsecase.name);
  public constructor(
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

  public async execute(
    input: RegisterPaymentGuestPixInput,
  ): Promise<RegisterPaymentGuestPixOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InvalidInscriptionIdUsecaseException(
        `Tentativa de registrar o pagamento de uma inscrição mas o id ${input.inscriptionId} é invalido`,
        'Inscrição não encontrada',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    if (inscription.getStatus() != InscriptionStatus.PENDING) {
      throw new InscriptionNotReleasedForPaymentUsecaseException(
        `Tentativa de registrar um pagamento para a inscrição: ${inscription.getId()}, mas a inscrição não tem status valido: ${inscription.getStatus()}`,
        'O pagamento ainda não está liberado para esta inscrição.',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(inscription.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Tentativa de registrar um pagamento, mas a inscrição ${inscription.getId()} está relacionada a um evento desconhecido: ${inscription.getEventId()}`,
        'Não foi possível processar sua solicitação. Tente novamente mais tarde.',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    if (!event.getAllowedPaymentModes().includes(PaymentMode.PIX)) {
      throw new PaymentModeNotAllowedUsecaseException(
        `Tentativa de registrar um pagamento via PIX para o evento ${event.getId()}, mas este método não está liberado. Métodos permitidos: ${event.getAllowedPaymentModes().join(', ')}`,
        'O pagamento via PIX não está disponível para este evento.',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    const remainingDebt = Math.max(
      0,
      inscription.getTotalValue() - inscription.getTotalPaid(),
    );

    if (input.value > remainingDebt) {
      throw new OverpaymentNotAllowedUsecaseException(
        `Tentativa de registrar um pagamento referente a inscrição: ${inscription.getId()}mas o valor passado: ${input.value} excede o valor da divida: ${remainingDebt}`,
        `O valor passado é excede o valor saldo devedor da inscrição`,
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    if (!input.file) {
      throw new InvalidImageFormatUsecaseException(
        'Tentativa de registrar um pagamento sem enviar o comprovante',
        'O comprovante de pagamento é obrigatório',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    if (!input.name || !input.email) {
      throw new InvalidInputUsecaseException(
        'Tentativa de registrar um pagamento mas faltou dados ',
        'O nome do pagador é obrigatório',
        RegisterPaymentGuestPixUsecase.name,
      );
    }

    const imagePath = await this.processReceiptImage(
      input.file,
      event,
      input.value,
      input.name,
    );

    const payment = Payment.create({
      eventId: event.getId(),
      guestName: input.name,
      guestEmail: input.email,
      isGuest: true,
      status: StatusPayment.UNDER_REVIEW,
      totalValue: input.value,
      totalPaid: 0,
      totalReceived: 0,
      installment: 1,
      imageUrls: [imagePath],
      methodPayment: PaymentMethod.PIX,
      createdAt: new Date(input.date),
    });

    const paymentAllocation = PaymentAllocation.create({
      paymentId: payment.getId(),
      inscriptionId: inscription.getId(),
      value: payment.getTotalValue(),
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.paymentGateway.createTx(payment, tx);
      await this.paymentAllocationGateway.createTx(paymentAllocation, tx);
    });

    // Notificação aos responsáveis do evento
    void this.notifyEventResponsiblesAboutPayment(event, payment, inscription);
    // Notificação de pagamento processado com sucesso
    void this.notifyPaymentProcessed(event, payment, inscription);

    const output: RegisterPaymentGuestPixOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
      confirmationCode: inscription.getConfirmationCode(),
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
          RegisterPaymentGuestPixUsecase.name,
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

      // Define o nome da pasta com base no tipo de usuário
      const folderName = `payments/${sanitizedEventName}/guest/${sanitizedName}`;

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
        RegisterPaymentGuestPixUsecase.name,
      );
    }
  }

  private async notifyEventResponsiblesAboutPayment(
    event: Event,
    payment: Payment,
    inscription: Inscription,
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
      const inscriptionData = {
        inscriptionId: inscription.getId(),
        payerName: inscription.getResponsible(),
        payerEmail: inscription.getEmail(),
        payerPhone: inscription.getPhone(),
        totalValue: inscription.getTotalValue(),
      };

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
          inscriptions: [inscriptionData],
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
    inscription: Inscription,
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
        const confirmationCode = inscription.getConfirmationCode();
        const url = new URL(`${APP_URL}/guest/${event.getId()}/inscription`);
        if (confirmationCode) {
          url.searchParams.set('confirmationCode', confirmationCode);
        }
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
