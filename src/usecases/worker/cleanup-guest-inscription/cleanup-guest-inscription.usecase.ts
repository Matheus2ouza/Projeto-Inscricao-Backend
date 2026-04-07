import { Injectable, Logger } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { GuestExpiredCleanupEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-expired-cleanup-email.handler';
import {
  ListInscriptionsPdfGeneratorUtils,
  type ListInscriptionsPdfData,
} from 'src/shared/utils/pdfs/inscriptions/list-Inscriptions-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';

export type CleanupGuestInscriptionInput = void;

export type CleanupGuestInscriptionOutput = {
  cleanedCount: number;
  inscriptionsDeleted: DeletedGuestInscription[];
};

export type DeletedGuestInscription = {
  id: string;
  eventId: string;
  responsible: string;
  createdAt: Date;
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
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly eventGateway: EventGateway,
    private readonly accountGateway: AccountGateway,
    private readonly guestExpiredCleanupEmailHandler: GuestExpiredCleanupEmailHandler,
  ) {}

  async execute(input: void): Promise<CleanupGuestInscriptionOutput> {
    const now = new Date();
    this.logger.log(
      `Iniciando limpeza de inscrições guest expiradas antes de ${now.toISOString()}`,
    );
    // Busca as inscrições que foram marcadas como expiradas posteriormente
    const inscriptions =
      await this.inscriptionGateway.findManyGuestInscriptionMarkedExpired(now);
    this.logger.log(
      `Inscrições guest expiradas encontradas: ${inscriptions.length}`,
    );

    if (inscriptions.length === 0) {
      return {
        cleanedCount: 0,
        inscriptionsDeleted: [],
      };
    }

    // Deleta com validação de segurança (status/payment/cancelledAt) no banco
    const cleanedCount =
      await this.inscriptionGateway.deleteExpiredGuestInscription(
        inscriptions.map((inscription) => inscription.getId()),
        now,
      );
    this.logger.log(`Inscrições guest expiradas removidas: ${cleanedCount}`);

    // Mapeia as inscrições deletadas para o formato de saída enriquecido
    const inscriptionsDeleted: DeletedGuestInscription[] = inscriptions.map(
      (i: Inscription) => ({
        id: i.getId(),
        eventId: i.getEventId(),
        responsible: i.getResponsible(),
        createdAt: i.getCreatedAt(),
        guestName: i.getGuestName(),
      }),
    );

    if (cleanedCount > 0) {
      await this.notifyDeletedInscriptionsByEvent(inscriptionsDeleted);
    }

    const output: CleanupGuestInscriptionOutput = {
      cleanedCount,
      inscriptionsDeleted,
    };

    return output;
  }

  private async notifyDeletedInscriptionsByEvent(
    inscriptions: DeletedGuestInscription[],
  ): Promise<void> {
    const inscriptionsByEvent = new Map<string, DeletedGuestInscription[]>();

    inscriptions.forEach((inscription) => {
      const current = inscriptionsByEvent.get(inscription.eventId) ?? [];
      current.push(inscription);
      inscriptionsByEvent.set(inscription.eventId, current);
    });

    for (const [eventId, eventInscriptions] of inscriptionsByEvent.entries()) {
      try {
        const [event, responsibles] = await Promise.all([
          this.eventGateway.findById(eventId),
          this.eventResponsibleGateway.findByEventId(eventId),
        ]);

        if (!event) {
          this.logger.warn(
            `Evento não encontrado ao notificar limpeza de inscrições guest expiradas. eventId=${eventId}`,
          );
          continue;
        }

        const accountIds = Array.from(
          new Set(
            responsibles.map((responsible) => responsible.getAccountId()),
          ),
        );

        if (!accountIds.length) {
          this.logger.warn(
            `Nenhum responsável associado encontrado para o evento ${event.getName()} (${eventId}) ao notificar limpeza de inscrições guest expiradas.`,
          );
          continue;
        }

        const accounts = await this.accountGateway.findByIds(accountIds);

        const emails = accounts
          .map((account) => account.getEmail())
          .filter((email): email is string => !!email);

        if (!emails.length) {
          this.logger.warn(
            `Nenhum responsável com e-mail encontrado para o evento ${event.getName()} (${eventId}) ao notificar limpeza de inscrições guest expiradas.`,
          );
          continue;
        }

        const pdfData: ListInscriptionsPdfData = {
          header: {
            title: event.getName() ?? 'Evento',
            titleDetail: this.formatEventPeriod(
              event.getStartDate(),
              event.getEndDate(),
            ),
            subtitle: 'Lista de inscrições guest expiradas removidas',
            image: undefined,
          },
          inscriptions: eventInscriptions.map((inscription) => ({
            id: inscription.id,
            responsible: inscription.responsible,
            email: undefined,
            phone: undefined,
            locality: '-',
            status: InscriptionStatus.EXPIRED,
            createdAt: inscription.createdAt,
            isGuest: true,
            participants: [],
            payments: [],
          })),
        };

        const pdfBuffer =
          await ListInscriptionsPdfGeneratorUtils.generateListInscriptionsPdf(
            pdfData,
          );

        await this.guestExpiredCleanupEmailHandler.sendGuestExpiredCleanupEmail(
          {
            eventName: event.getName() ?? 'Evento',
            totalDeleted: eventInscriptions.length,
            to: emails,
            pdfBuffer,
          },
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Erro ao notificar responsáveis sobre limpeza de inscrições guest expiradas para o evento ${eventId}: ${err.message}`,
          err.stack,
        );
      }
    }
  }

  private formatEventPeriod(
    startDate?: Date | null,
    endDate?: Date | null,
  ): string | undefined {
    const formattedStart = startDate
      ? new Date(startDate).toLocaleDateString('pt-BR')
      : undefined;
    const formattedEnd = endDate
      ? new Date(endDate).toLocaleDateString('pt-BR')
      : undefined;

    if (formattedStart && formattedEnd) {
      return `${formattedStart} até ${formattedEnd}`;
    }

    return formattedStart ?? formattedEnd ?? undefined;
  }
}
