import { Injectable, Logger } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';
import { Event } from 'src/domain/entities/event/event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { GuestInscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/guest-inscription-email.handler';
import { InscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-email.handler';
import {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from 'src/infra/services/mail/types/inscription/inscription-email.types';
import { getMissingRequiredFields } from 'src/shared/utils/participant-fields-completeness.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { LocalityNotFoundUsecaseException } from 'src/usecases/web/exceptions/locality/locality-not-found.usecase.exception';
import { MissingRequiredParticipantFieldsUsecaseException } from 'src/usecases/web/exceptions/participants/missing-required-participant-fields.usecase.exception';

export type RegisterGuestInscriptionInput = {
  localityId: string;
  eventId: string;

  // Dados do inscrito guest obrigatórios
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  gender: genderType;

  // Dados da inscrição guest opcionais
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;

  // id da inscrição
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionOutput = {
  id: string;
  status: InscriptionStatus;
  confirmationCode?: string;
  expiresAt?: Date | string;
};

@Injectable()
export class RegisterGuestInscriptionUsecase
  implements
    Usecase<RegisterGuestInscriptionInput, RegisterGuestInscriptionOutput>
{
  private readonly logger = new Logger(RegisterGuestInscriptionUsecase.name);

  constructor(
    private readonly eventGateway: EventGateway,
    private readonly localityGateway: LocalityGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly accountGateway: AccountGateway,
    private readonly guestInscriptionEmailHandler: GuestInscriptionEmailHandler,
    private readonly inscriptionEmailHandler: InscriptionEmailHandler,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: RegisterGuestInscriptionInput,
  ): Promise<RegisterGuestInscriptionOutput> {
    console.log(JSON.stringify(input, null, 2));
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const locality = await this.localityGateway.findById(input.localityId);

    if (!locality) {
      throw new LocalityNotFoundUsecaseException(
        `Tentativa de criar uma inscrição mas a localidade informada ${input.localityId} é invalida`,
        `Localidade não encontrada ou invalida`,
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const typeInscription = await this.typeInscriptionGateway.findById(
      input.typeInscriptionId,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} with type inscription: ${input.typeInscriptionId} but it was not found`,
        'Tipo de inscrição não encontrado',
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const participantFieldsConfig = event.getParticipantFieldsConfig();
    const missingFields = getMissingRequiredFields(participantFieldsConfig, {
      cpf: input.cpf,
      preferredName: input.preferredName,
      shirtSize: input.shirtSize,
    });

    if (missingFields.length > 0) {
      throw new MissingRequiredParticipantFieldsUsecaseException(
        `attempt to create guest inscription for event: ${input.eventId} but participant is missing required fields: ${missingFields.join(', ')}`,
        `Preencha os campos obrigatórios: ${missingFields.join(', ')}`,
        RegisterGuestInscriptionUsecase.name,
      );
    }

    const inscription = Inscription.create({
      localityId: locality.getId(),
      eventId: event.getId(),
      guestName: input.name,
      guestEmail: input.email,
      responsible: input.name,
      phone: input.phone,
      email: input.email,
      isGuest: true,
      status: typeInscription.getSpecialType()
        ? InscriptionStatus.UNDER_REVIEW
        : InscriptionStatus.PENDING,
      totalValue: typeInscription.getValue(),
      // expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30min
    });

    const participant = Participant.create({
      inscriptionId: inscription.getId(),
      typeInscriptionId: typeInscription.getId(),
      name: input.name,
      cpf: input.cpf,
      preferredName: input.preferredName,
      shirtSize: input.shirtSize,
      shirtType: input.shirtType,
      birthDate: new Date(input.birthDate),
      gender: input.gender,
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

    // começa a persistir os dados no bancos
    await this.prisma.runInTransaction(async (tx) => {
      await this.inscriptionGateway.createTx(inscription, tx);
      await this.participantGateway.createTx(participant, tx);
    });

    const output: RegisterGuestInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      confirmationCode: inscription.getConfirmationCode(),
      expiresAt: inscription.getExpiresAt() || 'indefinite',
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
