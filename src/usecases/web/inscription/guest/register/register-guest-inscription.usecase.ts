import { Injectable, Logger } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { GuestInscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-inscription-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

export type RegisterGuestInscriptionInput = {
  eventId: string;
  guestEmail: string;
  guestName: string;
  guestLocality: string;
  phone: string;
  participant: ParticipantGuest;
};

export type ParticipantGuest = {
  name: string;
  birthDate: Date;
  gender: genderType;
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionOutput = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};

@Injectable()
export class RegisterGuestInscriptionUsecase
  implements
    Usecase<RegisterGuestInscriptionInput, RegisterGuestInscriptionOutput>
{
  private readonly logger = new Logger(RegisterGuestInscriptionUsecase.name);

  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly guestInscriptionEmailHandler: GuestInscriptionEmailHandler,
  ) {}

  async execute(
    input: RegisterGuestInscriptionInput,
  ): Promise<RegisterGuestInscriptionOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const typeInscription = await this.typeInscriptionGateway.findById(
      input.participant.typeInscriptionId,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} with type inscription: ${input.participant.typeInscriptionId} but it was not found`,
        'Tipo de inscrição não encontrado',
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const inscription = Inscription.create({
      eventId: event.getId(),
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestLocality: input.guestLocality,
      responsible: input.guestName,
      phone: input.phone,
      email: input.guestEmail,
      isGuest: true,
      status: typeInscription.getSpecialType()
        ? InscriptionStatus.UNDER_REVIEW
        : InscriptionStatus.PENDING,
      totalValue: typeInscription.getValue(),
    });

    await this.inscriptionGateway.create(inscription);

    const participant = Participant.create({
      inscriptionId: inscription.getId(),
      typeInscriptionId: typeInscription.getId(),
      name: input.participant.name,
      birthDate: input.participant.birthDate,
      gender: input.participant.gender,
    });

    await this.participantGateway.create(participant);

    if (inscription.getStatus() === InscriptionStatus.PENDING) {
      void this.sendGuestInscriptionEmail(event.getId(), inscription).catch(
        (error) => {
          this.logger.error(
            `Erro ao enviar e-mail de inscrição guest ${inscription.getId()} para o evento ${event.getId()}: ${error.message}`,
            error.stack,
          );
        },
      );
    }

    const output: RegisterGuestInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      confirmationCode: inscription.getConfirmationCode()!,
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

      const accessToken = inscription.getAccessToken();
      if (!accessToken) {
        this.logger.warn(
          `Inscrição guest ${inscription.getId()} não possui access token para envio de e-mail`,
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
        accessUrl: `${process.env.URL_CALLBACK}/guest/inscription?confirmationCode=${encodeURIComponent(
          confirmationCode,
        )}`,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de inscrição guest ${inscription.getId()} para o evento ${eventId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
