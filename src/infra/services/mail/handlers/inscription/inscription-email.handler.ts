import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import type {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from '../../types/inscription/inscription-email.types';

@Injectable()
export class InscriptionEmailHandler {
  private readonly logger = new Logger(InscriptionEmailHandler.name);

  constructor(private readonly mailService: MailService) {}

  /**
   * Envia e-mail de notificação de inscrição para os responsáveis do evento
   */
  async sendInscriptionNotification(
    inscriptionData: InscriptionEmailData,
    responsibles: EventResponsibleEmailData[],
  ): Promise<void> {
    try {
      if (responsibles.length === 0) {
        this.logger.warn(
          `Evento "${inscriptionData.eventName}" não possui responsáveis cadastrados. Nenhum e-mail será enviado.`,
        );
        return;
      }

      const baseContext = {
        eventData: { ...inscriptionData },
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
          subject: `Nova Inscrição - ${inscriptionData.eventName}`,
          templateName: 'inscription/inscription-notification',
          context: baseContext,
        });

        this.logger.log(
          `E-mail de inscrição enviado para ${responsible.username} (${responsible.email})`,
        );
      });

      await Promise.all(emailPromises);

      this.logger.log(
        `E-mails de inscrição enviados para ${responsibles.length} responsável(is) do evento "${inscriptionData.eventName}"`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de inscrição: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
