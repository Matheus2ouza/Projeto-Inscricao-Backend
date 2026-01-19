import { Injectable, Logger } from '@nestjs/common';
import type { EventResponsibleEmailData } from '../../types/inscription/inscription-email.types';
import type { TicketSaleNotificationEmailData } from '../../types/tickets/ticket-sale-notification-email.types';
import { MailService } from '../../mail.service';

@Injectable()
export class TicketSaleNotificationEmailHandler {
  private readonly logger = new Logger(TicketSaleNotificationEmailHandler.name);

  public constructor(private readonly mailService: MailService) {}

  public async sendTicketSaleNotification(
    saleData: TicketSaleNotificationEmailData,
    responsibles: EventResponsibleEmailData[],
  ): Promise<void> {
    try {
      if (!responsibles.length) {
        this.logger.warn(
          `Evento "${saleData.eventName}" não possui responsáveis com e-mail cadastrado. Nenhuma notificação foi enviada.`,
        );
        return;
      }

      const baseContext = {
        saleData,
        responsibles,
        year: new Date().getFullYear(),
        currentDate: new Date(),
      };

      const deliveries = responsibles.map(async (responsible) => {
        if (!responsible.email) {
          this.logger.warn(
            `Responsável ${responsible.username} não possui e-mail cadastrado.`,
          );
          return;
        }

        await this.mailService.sendTemplateMail({
          to: responsible.email,
          subject: `Nova venda em pré-análise - ${saleData.eventName}`,
          templateName: 'tickets/pre-sale-notification',
          context: baseContext,
        });

        this.logger.log(
          `Notificação de pré-venda enviada para ${responsible.username} (${responsible.email}).`,
        );
      });

      await Promise.all(deliveries);

      this.logger.log(
        `Notificações de pré-venda enviadas para ${responsibles.length} responsável(is) do evento "${saleData.eventName}"`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de pré-venda: ${error.message}`,
        error.stack,
      );
    }
  }
}
