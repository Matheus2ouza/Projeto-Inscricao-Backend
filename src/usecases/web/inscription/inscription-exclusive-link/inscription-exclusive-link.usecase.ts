import { Injectable, Logger } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { GuestInscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-inscription-email.handler';
import { InscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-email.handler';
import {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from 'src/infra/services/mail/types/inscription/inscription-email.types';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { ExclusiveInscriptionLinkNotFoundException } from '../../exceptions/exclusive-inscription-link/exclusive-inscription-link-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { ParticipantLimitReachedUsecaseException } from '../../exceptions/type-Inscription/participant-limit-reached.usecase.exception';

export type InscriptionExclusiveLinkInput = {
  eventId: string;
  exclusiveInscriptionLink: string;

  // Dados do inscrito
  guestEmail: string;
  guestName: string;
  preferredName?: string;
  cpf: string;
  gender: genderType;
  phone: string;
  guestLocality: string;
  birthDate: Date;

  //dados complementares
  observation: string;

  // id da inscrição
  typeInscriptionId: string;
};

export type InscriptionExclusiveLinkOutput = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};

@Injectable()
export class InscriptionExclusiveLinkUsecase
  implements
    Usecase<InscriptionExclusiveLinkInput, InscriptionExclusiveLinkOutput>
{
  private readonly logger = new Logger(InscriptionExclusiveLinkUsecase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly exclusiveInscriptionLinkGateway: ExclusiveInscriptionLinkGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participanteGateway: ParticipantGateway,
    private readonly accountGateway: AccountGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly guestInscriptionEmailHandler: GuestInscriptionEmailHandler,
    private readonly inscriptionEmailHandler: InscriptionEmailHandler,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: InscriptionExclusiveLinkInput,
  ): Promise<InscriptionExclusiveLinkOutput> {
    // validação do evento
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempting to create a registration, but the passed event ID is invalid.`,
        `Evento não encontrado`,
        InscriptionExclusiveLinkUsecase.name,
      );
    }

    // validação do link
    const exclusiveLink =
      await this.exclusiveInscriptionLinkGateway.findByToken(
        input.exclusiveInscriptionLink,
      );

    if (!exclusiveLink) {
      throw new ExclusiveInscriptionLinkNotFoundException(
        `Attempting to create a registration, but the passed exclusive inscription link ID is invalid`,
        `Link de inscrição invalido`,
        InscriptionExclusiveLinkUsecase.name,
      );
    }

    const typeInscription = await this.typeInscriptionGateway.findById(
      input.typeInscriptionId,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} with type inscription: ${input.typeInscriptionId} but it was not found`,
        'Tipo de inscrição não encontrado',
        InscriptionExclusiveLinkUsecase.name,
      );
    }

    const currentCount =
      await this.typeInscriptionGateway.countParticipantsUsingTypeInscription(
        typeInscription.getId(),
      );

    if (
      typeInscription.getLimitIsStrict() &&
      currentCount >= typeInscription.getParticipantLimit()
    ) {
      throw new ParticipantLimitReachedUsecaseException(
        `Attempted to register a registration, but the selected registration type has already reached its limit. typeInscription ID: ${typeInscription.getId()}`,
        `Infelizmente este tipo de inscrição atingiu seu limite`,
        InscriptionExclusiveLinkUsecase.name,
      );
    }
    // cria a inscrição em memoria
    const inscription = Inscription.create({
      eventId: event.getId(),
      guestName: input.guestName.trim(),
      guestEmail: input.guestEmail.trim(),
      responsible: input.guestName.trim(),
      phone: input.phone.trim(),
      email: input.guestEmail.trim(),
      isGuest: true,
      status: typeInscription.getSpecialType()
        ? InscriptionStatus.UNDER_REVIEW
        : InscriptionStatus.PENDING,
      totalValue: typeInscription.getValue(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30min
      observation: input.observation.trim(),
      exclusiveLinkId: exclusiveLink.getId(),
    });

    // cria o participante em memoria
    const participant = Participant.create({
      inscriptionId: inscription.getId(),
      typeInscriptionId: typeInscription.getId(),
      name: input.guestName,
      cpf: input.cpf,
      preferredName: input.preferredName ?? input.guestName,
      birthDate: new Date(input.birthDate),
      gender: input.gender,
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.inscriptionGateway.createTx(inscription, tx);
      await this.participanteGateway.createTx(participant, tx);
    });

    if (inscription.getStatus() === InscriptionStatus.PENDING) {
      void this.sendGuestInscriptionEmail(event.getId(), inscription).catch(
        (error: unknown) => {
          const err = error as Error;
          this.logger.error(
            `Erro ao enviar e-mail de inscrição guest ${inscription.getId()} para o evento ${event.getId()}: ${err.message}`,
            err.stack,
          );
        },
      );
    }

    if (inscription.getStatus() === InscriptionStatus.UNDER_REVIEW) {
      void this.sendUnderReviewNotification(
        event,
        inscription,
        typeInscription.getValue(),
      ).catch((error: unknown) => {
        const err = error as Error;
        this.logger.error(
          `Erro ao enviar notificação de inscrição em análise ${inscription.getId()} para o evento ${event.getId()}: ${err.message}`,
          err.stack,
        );
      });
    }

    const output: InscriptionExclusiveLinkOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      confirmationCode: inscription.getConfirmationCode() || '',
    };

    return output;
  }

  private async sendGuestInscriptionEmail(
    eventId: string,
    inscription: Inscription,
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de e-mail de inscrição guest ${inscription.getId()} para o evento ${eventId}`,
      );

      const event = await this.eventGateway.findById(eventId);
      if (!event) {
        this.logger.warn(
          `Evento ${eventId} não encontrado para envio de e-mail de inscrição guest`,
        );
        return;
      }

      const confirmationCode = inscription.getConfirmationCode();
      if (!confirmationCode) {
        this.logger.warn(
          `Inscrição guest ${inscription.getId()} não possui confirmationCode para envio de e-mail`,
        );
        return;
      }

      const guestEmail = inscription.getGuestEmail();
      if (!guestEmail) {
        this.logger.warn(
          `Inscrição guest ${inscription.getId()} não possui e-mail para envio`,
        );
        return;
      }

      await this.guestInscriptionEmailHandler.sendGuestInscriptionEmail({
        eventName: event.getName(),
        guestName: inscription.getGuestName() ?? 'Participante',
        guestEmail,
        accessUrl: `${process.env.URL_CALLBACK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(
          confirmationCode,
        )}`,
        confirmationCode,
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar e-mail de inscrição guest ${inscription.getId()} para o evento ${eventId}: ${err.message}`,
        err.stack,
      );
    }
  }

  private async sendUnderReviewNotification(
    event: Event,
    inscription: Inscription,
    totalValue: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de notificação de inscrição em análise ID: ${inscription.getId()}, Responsável: ${inscription.getResponsible()}, Evento: ${event.getId()}`,
      );

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(event.getId());

      if (!eventResponsibles.length) {
        this.logger.warn(
          `Evento ${event.getId()} não possui responsáveis para notificação`,
        );
        return;
      }

      const accountIds = eventResponsibles.map((r) => r.getAccountId());
      const accounts = await this.accountGateway.findByIds(accountIds);

      const responsiblesEmailData: EventResponsibleEmailData[] = accounts
        .filter((account) => !!account.getEmail())
        .map((account) => ({
          id: account.getId(),
          username: account.getUsername(),
          email: account.getEmail()!, // agora é seguro
        }));

      const inscriptionEmailData: InscriptionEmailData = {
        eventName: event.getName(),
        eventImageUrl: event.getImageUrl(),
        responsibleName: inscription.getGuestName() || 'Convidado',
        responsiblePhone: inscription.getPhone() || '',
        responsibleEmail: inscription.getGuestEmail() || '',
        totalValue: totalValue,
        participantCount: 1,
        inscriptionDate: new Date(),
        eventStartDate: event.getStartDate(),
        eventEndDate: event.getEndDate(),
        eventLocation: event.getLocation() || 'Local não informado',
      };

      await this.inscriptionEmailHandler.sendInscriptionNotification(
        inscriptionEmailData,
        responsiblesEmailData,
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Erro ao enviar notificação de inscrição em análise ${inscription.getId()} para o evento ${event.getId()}: ${err.message}`,
        err.stack,
      );
    }
  }
}
