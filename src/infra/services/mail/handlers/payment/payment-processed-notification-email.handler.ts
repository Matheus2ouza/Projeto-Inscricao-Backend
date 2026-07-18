import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import type { PaymentProcessedNotificationEmailData } from '../../types/payment/payment-processed-notification-email.types';

@Injectable()
export class PaymentProcessedNotificationEmailHandler {
  private readonly logger = new Logger(
    PaymentProcessedNotificationEmailHandler.name,
  );

  constructor(private readonly mailService: MailService) {}

  async sendPaymentProcessedNotification(
    eventName: string,
    paymentData: PaymentProcessedNotificationEmailData,
    actionUrl: string | null,
  ): Promise<void> {
    try {
      const baseContext = {
        paymentData: { ...paymentData },
        year: new Date().getFullYear(),
        currentDate: new Date(),
        actionUrl,
      };

      await this.mailService.sendTemplateMail({
        to: paymentData.email,
        subject: `Pagamento processado - ${eventName}`,
        templateName: 'payment/payment-processed-notification',
        context: baseContext,
      });

      this.logger.log(
        `E-mail de pagamento processado enviado para ${paymentData.name} (${paymentData.email})`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar notificação de pagamento processado: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
