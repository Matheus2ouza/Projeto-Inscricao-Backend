import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import type { EventResponsibleEmailData } from '../../types/inscription/inscription-email.types';
import type { PaymentReviewNotificationEmailData } from '../../types/payment/payment-review-notification-email.types';

@Injectable()
export class PaymentReviewNotificationEmailHandler {
  private readonly logger = new Logger(
    PaymentReviewNotificationEmailHandler.name,
  );

  constructor(private readonly mailService: MailService) {}

  async sendNewPaymentNotification(
    paymentData: PaymentReviewNotificationEmailData,
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
          subject: `Novo pagamento em análise - ${paymentData.eventName}`,
          templateName: 'payment/payment-review-notification',
          context: baseContext,
        });

        this.logger.log(
          `E-mail de novo pagamento enviado para ${responsible.username} (${responsible.email})`,
        );
      });

      await Promise.all(emailPromises);

      this.logger.log(
        `E-mails de pagamento em análise enviados para ${responsibles.length} responsável(is) do evento "${paymentData.eventName}"`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de pagamento em análise: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
