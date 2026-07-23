import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import { PaymentEmailData } from '../../types/payment/payment-email.types';

@Injectable()
export class PaymentApprovedEmailHandler {
  private readonly logger = new Logger(PaymentApprovedEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  /**
   * Envia e-mail de pagamento aprovado
   */
  async sendPaymentApprovedEmail({
    payment,
    event,
    inscriptions,
    allocations,
  }: PaymentEmailData): Promise<void> {
    try {
      const APP_URL = process.env.APP_URL;

      let redirectionUrl: string | null = null;
      if (!APP_URL) {
        this.logger.warn(
          `Variável de ambiente não definida, seguindo sem a redirection url`,
        );
      }

      // caso tenha a url então começa a criar o redirect
      if (APP_URL && inscriptions.length > 0) {
        // caso senha guest cria para a rota guest
        if (payment.getIsGuest()) {
          const confirmationCode = inscriptions[0].getConfirmationCode();
          const url = new URL(`${APP_URL}/guest/${event.getId()}/inscription`);
          if (confirmationCode) {
            url.searchParams.set('confirmationCode', confirmationCode);
          }
          redirectionUrl = url.toString();
        }

        if (!payment.getIsGuest()) {
          const url = new URL(`${APP_URL}/login`);
          redirectionUrl = url.toString();
        }
      }

      await this.mailService.sendTemplateMail({
        to: payment.getGuestEmail() as string,
        subject: `Pagamento Aprovado - ${event.getName()}`,
        templateName: 'payment/payment-approved',
        context: {
          event,
          payment,
          inscriptions,
          redirectionUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(
        `E-mail de pagamento aprovado enviado para ${payment.getGuestName()} (${payment.getGuestEmail()})`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar e-mail de pagamento aprovado: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
