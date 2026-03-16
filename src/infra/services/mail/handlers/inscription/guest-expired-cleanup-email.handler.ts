import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';

export type GuestExpiredCleanupEmailData = {
  eventName: string;
  totalDeleted: number;
  to: string[];
  pdfBuffer?: Buffer;
};

@Injectable()
export class GuestExpiredCleanupEmailHandler {
  private readonly logger = new Logger(GuestExpiredCleanupEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  async sendGuestExpiredCleanupEmail(
    data: GuestExpiredCleanupEmailData,
  ): Promise<void> {
    try {
      const subject = `Limpeza de inscrições guest expiradas - ${data.eventName}`;
      const attachments =
        data.pdfBuffer && data.pdfBuffer.length > 0
          ? [
              {
                filename: `inscricoes-guest-expiradas-${this.slugify(data.eventName)}.pdf`,
                content: data.pdfBuffer,
              },
            ]
          : undefined;

      // Envia um e-mail para cada responsável
      for (const recipient of data.to) {
        await this.mailService.sendTemplateMail({
          to: recipient,
          subject,
          templateName: 'inscription/guest-expired-cleanup',
          context: {
            eventName: data.eventName,
            totalDeleted: data.totalDeleted,
            year: new Date().getFullYear(),
          },
          attachments,
        });
      }

      this.logger.log(
        `E-mail de limpeza de inscrições guest expiradas enviado para responsáveis do evento "${data.eventName}" (total deletado: ${data.totalDeleted}).`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar e-mail de limpeza de inscrições guest expiradas: ${err.message}`,
        err.stack,
      );
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}

