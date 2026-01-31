import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import { GuestInscriptionEmailData } from '../../types/inscription/guest-inscription-email.types';

@Injectable()
export class GuestInscriptionEmailHandler {
  private readonly logger = new Logger(GuestInscriptionEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  async sendGuestInscriptionEmail(
    data: GuestInscriptionEmailData,
  ): Promise<void> {
    try {
      await this.mailService.sendTemplateMail({
        to: data.guestEmail,
        subject: `Inscrição registrada - ${data.eventName}`,
        templateName: 'inscription/guest-registration',
        context: { guestData: data, year: new Date().getFullYear() },
      });

      this.logger.log(
        `E-mail de inscrição guest enviado para ${data.guestName} (${data.guestEmail})`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar e-mail de inscrição guest: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
