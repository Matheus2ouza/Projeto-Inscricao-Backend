import { Injectable, Logger } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { AccountParticipantInEvent as AccountParticipantInEventEntity } from 'src/domain/entities/account-participant-in-event.entity';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { InscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-email.handler';
import { InscriptionEmailData } from 'src/infra/services/mail/types/inscription/inscription-email.types';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { MemberAlreadyInscribedUsecaseException } from 'src/usecases/web/exceptions/members/member-already-inscriptibed.usecase.exception';
import { MemberNotFoundUsecaseException } from 'src/usecases/web/exceptions/members/member-not-found.usecase.exception';

export type RegisterIndivInscriptionUsecaseInput = {
  accountId: string;
  eventId: string;
  responsible: string;
  email?: string;
  phone: string;
  member: member;
};

export type member = {
  accountParticipantId: string;
  typeInscriptionId: string;
};

export type RegisterIndivInscriptionUsecaseOutput = {
  id: string;
};

@Injectable()
export class RegisterIndivInscriptionUsecase
  implements
    Usecase<
      RegisterIndivInscriptionUsecaseInput,
      RegisterIndivInscriptionUsecaseOutput
    >
{
  private readonly logger = new Logger(RegisterIndivInscriptionUsecase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly inscriptionEmailHandler: InscriptionEmailHandler,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
  ) {}

  async execute(
    input: RegisterIndivInscriptionUsecaseInput,
  ): Promise<RegisterIndivInscriptionUsecaseOutput> {
    // 1. Verificar evento
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create individual inscription for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterIndivInscriptionUsecase.name,
      );
    }

    // 2. Verificar membro
    const accountParticipantExists =
      await this.accountParticipantGateway.findById(
        input.member.accountParticipantId,
      );

    if (!accountParticipantExists) {
      throw new MemberNotFoundUsecaseException(
        `attempt to create individual inscription for member: ${input.member.accountParticipantId} but it was not found`,
        'Membro não encontrado',
        RegisterIndivInscriptionUsecase.name,
      );
    }

    const accountParticipantInEventExists =
      await this.accountParticipantInEventGateway.findByParticipantAndEvent(
        input.member.accountParticipantId,
        input.eventId,
      );

    if (accountParticipantInEventExists) {
      throw new MemberAlreadyInscribedUsecaseException(
        `attempt to create individual inscription for member: ${input.member.accountParticipantId} but it is already inscribed in event: ${input.eventId}`,
        'Membro já inscrito no evento',
        RegisterIndivInscriptionUsecase.name,
      );
    }

    // 4. Verificar tipo de inscrição
    const typeInscription = await this.typeInscriptionGateway.findById(
      input.member.typeInscriptionId,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create individual inscription for type inscription: ${input.member.typeInscriptionId} but it was not found`,
        'Tipo de inscrição não encontrado',
        RegisterIndivInscriptionUsecase.name,
      );
    }

    // 5. Definir status da inscrição
    const status = typeInscription.getSpecialType()
      ? InscriptionStatus.UNDER_REVIEW
      : InscriptionStatus.PENDING;

    // 6. Criar inscrição
    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: input.eventId,
      responsible: input.responsible,
      email: input.email,
      phone: input.phone,
      totalValue: typeInscription.getValue(),
      status,
    });

    await this.inscriptionGateway.create(inscription);

    // 7. Criar relação membro-inscrição-evento
    const accountParticipantInEvent = AccountParticipantInEventEntity.create({
      accountParticipantId: input.member.accountParticipantId,
      inscriptionId: inscription.getId(),
      typeInscriptionId: input.member.typeInscriptionId,
    });

    await this.accountParticipantInEventGateway.create(
      accountParticipantInEvent,
    );

    await this.eventGateway.incrementQuantityParticipants(
      eventExists.getId(),
      1,
    );

    // 9. Enviar e-mail de notificação
    void this.sendInscriptionNotificationEmail(
      eventExists.getId(),
      inscription,
    ).catch((error) => {
      this.logger.error(
        `Erro ao enviar e-mail de notificação de inscrição individual ${inscription.getId()} para o evento ${eventExists.getId()}: ${error.message}`,
      );
    });

    const output: RegisterIndivInscriptionUsecaseOutput = {
      id: inscription.getId(),
    };

    return output;
  }

  /**
   * Envia e-mail de notificação de inscrição para os responsáveis do evento
   */
  private async sendInscriptionNotificationEmail(
    eventId: string,
    inscription: InscriptionEntity,
  ): Promise<void> {
    try {
      this.logger.log(
        `Iniciando envio de e-mail de notificação de inscrição individual ${inscription.getId()} para o evento ${eventId}`,
      );
      // Buscar dados do evento
      const event = await this.eventGateway.findById(eventId);
      if (!event) {
        this.logger.warn(
          `Evento ${eventId} não encontrado para envio de e-mail de inscrição individual`,
        );
        return;
      }

      // Buscar responsáveis do evento
      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(eventId);

      // Buscar dados dos usuários responsáveis
      const responsibleUsers = await Promise.all(
        eventResponsibles.map(async (responsible) => {
          const user = await this.userGateway.findById(
            responsible.getAccountId(),
          );
          const userData = {
            id: responsible.getAccountId(),
            username: user?.getUsername() || 'Usuário não encontrado',
            email: user?.getEmail(),
          };
          return userData;
        }),
      );

      // Verificar se a inscrição possui um ID de conta associado
      const accountId = inscription.getAccountId();
      if (!accountId) {
        this.logger.warn(
          `Inscrição ${inscription.getId()} não possui um ID de conta associado para envio de e-mail de inscrição individual`,
        );
        return;
      }

      // Buscar dados da conta que fez a inscrição
      const accountUser = await this.userGateway.findById(accountId);

      // Prepara dados para o e-mail
      const emailData: InscriptionEmailData = {
        eventName: event.getName(),
        eventImageUrl: event.getImageUrl(),
        responsibleName: inscription.getResponsible(),
        responsiblePhone: inscription.getPhone(),
        responsibleEmail: inscription.getEmail(),
        totalValue: inscription.getTotalValue(),
        participantCount: 1,
        accountUsername: accountUser?.getUsername() || 'Usuário não encontrado',
        inscriptionDate: inscription.getCreatedAt(),
        eventStartDate: event.getStartDate(),
        eventEndDate: event.getEndDate(),
        eventLocation: event.getLocation(),
      };

      await this.inscriptionEmailHandler.sendInscriptionNotification(
        emailData,
        responsibleUsers,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de notificação de inscrição individual ${inscription.getId()} para o evento ${eventId}: ${error.message}`,
        error.stack,
      );
      // Não lançar exceção para não interromper o fluxo principal
    }
  }
}
