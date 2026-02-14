import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import { GuestExpiredEmailData } from '../../types/inscription/guest-expired-email.types';

@Injectable()
export class GuestExpiredEmailHandler {
  private readonly logger = new Logger(GuestExpiredEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  async sendGuestExpiredEmail(data: GuestExpiredEmailData): Promise<void> {
    try {
      await this.mailService.sendTemplateMail({
        to: data.guestEmail,
        subject: `Inscrição cancelada - ${data.eventName}`,
        templateName: 'inscription/guest-expired',
        context: { guestData: data, year: new Date().getFullYear() },
      });

      this.logger.log(
        `E-mail de inscrição cancelada enviado para ${data.guestName} (${data.guestEmail})`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar e-mail de inscrição expirada: ${err.message}`,
        err.stack,
      );
    }
  }
}
