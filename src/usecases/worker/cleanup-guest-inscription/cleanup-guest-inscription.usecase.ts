import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { GuestExpiredEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-expired-email.handler';
import { Usecase } from 'src/usecases/usecase';

export type CleanupGuestInscriptionInput = void;

export type CleanupGuestInscriptionOutput = {
  cleanedCount: number;
  inscriptionsDeleted: Inscription[];
};

type Inscription = {
  id: string;
  guestName?: string;
};

@Injectable()
export class CleanupGuestInscriptionUsecase
  implements
    Usecase<CleanupGuestInscriptionInput, CleanupGuestInscriptionOutput>
{
  private readonly logger = new Logger(CleanupGuestInscriptionUsecase.name);

  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly guestExpiredEmailHandler: GuestExpiredEmailHandler,
  ) {}

  async execute(input: void): Promise<CleanupGuestInscriptionOutput> {
    // Prepara a variavel para a query
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const now = new Date();
    const expiredDate = new Date(now.getTime() - THIRTY_MINUTES);

    // Retorna todas as inscrições que tem o status PENDING, e sem pagamentos vinculados
    const inscriptions =
      await this.inscriptionGateway.findManyGuestInscriptionExpired(
        expiredDate,
      );

    // Se não houver inscrições, retorna
    if (inscriptions.length === 0) {
      return {
        cleanedCount: 0,
        inscriptionsDeleted: [],
      };
    }

    // Envia e-mail para cada inscrição expirada
    for (const inscription of inscriptions) {
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
              registerUrl: `${process.env.APP_URL}/guest/${eventId}`,
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
    }

    // Deleta as inscrições
    const cleanedCount =
      await this.inscriptionGateway.deleteExpiredGuestInscription(
        inscriptions.map((i) => i.getId()),
        expiredDate,
      );

    const inscriptionsDeleted = inscriptions.map((i) => ({
      id: i.getId(),
      guestName: i.getGuestName(),
    }));

    return {
      cleanedCount,
      inscriptionsDeleted,
    };
  }
}
