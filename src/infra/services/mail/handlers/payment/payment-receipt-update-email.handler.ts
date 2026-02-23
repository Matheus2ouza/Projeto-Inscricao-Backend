import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import type {
  EventResponsibleEmailData,
  PaymentReceiptUpdateEmailData,
} from '../../types/payment/payment-receipt-update-email.types';

@Injectable()
export class PaymentReceiptUpdateEmailHandler {
  private readonly logger = new Logger(PaymentReceiptUpdateEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  async sendNewPaymentReceiptUpdate(
    paymentData: PaymentReceiptUpdateEmailData,
    responsibles: EventResponsibleEmailData[],
  ): Promise<void> {
    try {
      if (responsibles.length === 0) {
        this.logger.warn(
          `Evento "${paymentData.eventName}" não possui responsáveis cadastrados. Nenhum e-mail será enviado.`,
        );
        return;
      }

      const baseContext = {
        paymentData: { ...paymentData },
        responsibles,
        year: new Date().getFullYear(),
        currentDate: new Date(),
      };

      const emailPromises = responsibles.map(async (responsible) => {
        if (!responsible.email) {
          this.logger.warn(
            `Responsável ${responsible.username} não possui e-mail cadastrado`,
          );
          return;
        }

        await this.mailService.sendTemplateMail({
          to: responsible.email,
          subject: `Comprovante de pagamento atualizado - ${paymentData.eventName}`,
          templateName: 'payment/payment-receipt-update',
          context: baseContext,
        });

        this.logger.log(
          `E-mail de comprovante atualizado enviado para ${responsible.username} (${responsible.email})`,
        );
      });

      await Promise.all(emailPromises);

      this.logger.log(
        `E-mails de comprovante atualizado enviados para ${responsibles.length} responsável(is) do evento "${paymentData.eventName}"`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de comprovante atualizado: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
