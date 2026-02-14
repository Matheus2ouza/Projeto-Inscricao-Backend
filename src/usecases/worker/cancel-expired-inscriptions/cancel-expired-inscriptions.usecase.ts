import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { GuestExpiredEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-expired-email.handler';
import { Usecase } from 'src/usecases/usecase';

export type CancelExpiredInscriptionsInput = void;

export type CancelExpiredInscriptionsOutput = {
  countInscriptionsCancelled: number;
  inscriptions: Inscription[];
};

export type Inscription = {
  id: string;
  guestName?: string;
};

@Injectable()
export class CancelExpiredInscriptionsUseCase
  implements
    Usecase<CancelExpiredInscriptionsInput, CancelExpiredInscriptionsOutput>
{
  private readonly logger = new Logger(CancelExpiredInscriptionsUseCase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly guestExpiredEmailHandler: GuestExpiredEmailHandler,
  ) {}

  async execute(input: void): Promise<CancelExpiredInscriptionsOutput> {
    // Prepara a variavel para a query
    const now = new Date();

    this.logger.log(
      `Cancelando inscrições expiradas antes de ${now.toISOString()}`,
    );

    // Busca as inscrições Guest que expiraram
    const inscriptions =
      await this.inscriptionGateway.findManyGuestInscriptionExpired(now);

    // Caso não encontre nenhuma retorna um array vazio
    if (!inscriptions || inscriptions.length === 0) {
      this.logger.log('Nenhuma inscrição expirada encontrada');
      return {
        countInscriptionsCancelled: 0,
        inscriptions: [],
      };
    }

    for (const inscription of inscriptions) {
      // Para cada inscrição expirada, tenta enviar o e-mail de expiração
      try {
        const eventId = inscription.getEventId();
        const guestEmail = inscription.getGuestEmail();
        const guestName = inscription.getGuestName();

        if (eventId && guestEmail) {
          const event = await this.eventGateway.findById(eventId);

          if (event) {
            await this.guestExpiredEmailHandler.sendGuestExpiredEmail({
              eventName: event.getName(),
              guestName: guestName ?? 'Participante',
              guestEmail: guestEmail,
              registerUrl: `${process.env.URL_CALLBACK}/guest/${eventId}`,
            });
          }
        }
      } catch (error) {
        this.logger.error(
          `Erro ao enviar e-mail de inscrição expirada para a inscrição ${inscription.getId()}: ${error.message}`,
          error.stack,
        );
        // Continua para a próxima inscrição mesmo se houver erro no envio do e-mail
      }

      // Cancela a inscrição com a função cancelInscription da entidade
      inscription.markAsExpired();
      await this.inscriptionGateway.cancel(inscription);
    }
    const output: CancelExpiredInscriptionsOutput = {
      countInscriptionsCancelled: inscriptions.length,
      inscriptions: inscriptions.map((i) => ({
        id: i.getId(),
        guestName: i.getGuestName(),
      })),
    };
    return output;
  }
}
