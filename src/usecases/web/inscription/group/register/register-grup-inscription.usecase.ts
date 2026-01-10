import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { AccountParticipantInEvent as AccountParticipantInEventEntity } from 'src/domain/entities/account-participant-in-event.entity';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { InscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { MemberAlreadyInscribedUsecaseException } from 'src/usecases/web/exceptions/members/member-already-inscriptibed.usecase.exception';
import { MemberNotFoundUsecaseException } from 'src/usecases/web/exceptions/members/member-not-found.usecase.exception';

export type RegisterGroupInscriptionUsecaseInput = {
  accountId: string;
  eventId: string;
  responsible: string;
  email?: string;
  phone: string;
  members: member[];
};

export type member = {
  accountParticipantId: string;
  typeInscriptionId: string;
};

export type RegisterGroupInscriptionUsecaseOutput = {
  id: string;
};

@Injectable()
export class RegisterGroupInscriptionUsecase
  implements
    Usecase<
      RegisterGroupInscriptionUsecaseInput,
      RegisterGroupInscriptionUsecaseOutput
    >
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
    private readonly inscriptionEmailHandler: InscriptionEmailHandler,
  ) {}

  async execute(
    input: RegisterGroupInscriptionUsecaseInput,
  ): Promise<RegisterGroupInscriptionUsecaseOutput> {
    // FASE 1: VALIDAÇÕES (antes de qualquer inserção)

    // 1. Verificar evento
    const eventExists = await this.eventGateway.findById(input.eventId);
    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create group inscription for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // 2. Extrair IDs
    const memberIds = input.members.map((m) => m.accountParticipantId);
    const typeInscriptionIds = input.members.map((m) => m.typeInscriptionId);

    // 3. Verificar membros
    const accountParticipants = await Promise.all(
      memberIds.map((id) => this.accountParticipantGateway.findById(id)),
    );

    const missingMembers = accountParticipants
      .map((participant, index) => ({ participant, id: memberIds[index] }))
      .filter((item) => !item.participant)
      .map((item) => item.id);

    if (missingMembers.length > 0) {
      throw new MemberNotFoundUsecaseException(
        `attempt to create group inscription for members: ${missingMembers.join(', ')} but they were not found`,
        `Membros não encontrados: ${missingMembers.join(', ')}`,
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // 4. Verificar duplicações
    const memberInscriptionChecks = await Promise.all(
      memberIds.map((id) =>
        this.accountParticipantInEventGateway.findByParticipantAndEvent(
          id,
          input.eventId,
        ),
      ),
    );

    const alreadyInscribedMembers = memberInscriptionChecks
      .map((check, index) => ({ check, id: memberIds[index] }))
      .filter((item) => item.check)
      .map((item) => item.id);

    if (alreadyInscribedMembers.length > 0) {
      throw new MemberAlreadyInscribedUsecaseException(
        `attempt to create group inscription for members: ${alreadyInscribedMembers.join(', ')} but they are already inscribed in event: ${input.eventId}`,
        `Membros já inscritos no evento: ${alreadyInscribedMembers.join(', ')}`,
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // 5. Verificar tipos de inscrição
    const typeInscriptions = await Promise.all(
      typeInscriptionIds.map((id) => this.typeInscriptionGateway.findById(id)),
    );

    const missingTypeInscriptions = typeInscriptions
      .map((type, index) => ({ type, id: typeInscriptionIds[index] }))
      .filter((item) => !item.type)
      .map((item) => item.id);

    if (missingTypeInscriptions.length > 0) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create group inscription for type inscriptions: ${missingTypeInscriptions.join(', ')} but they were not found`,
        `Tipos de inscrição não encontrados: ${missingTypeInscriptions.join(', ')}`,
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // FASE 2: INSERÇÕES (após todas as validações passarem)

    const hasSpecialType = typeInscriptions.some((type) =>
      type?.getSpecialType(),
    );
    const totalValue = typeInscriptions.reduce((sum, type) => {
      return sum + (type?.getValue() || 0);
    }, 0);

    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: input.eventId,
      responsible: input.responsible,
      email: input.email,
      phone: input.phone,
      totalValue,
      status: hasSpecialType
        ? InscriptionStatus.UNDER_REVIEW
        : InscriptionStatus.PENDING,
    });

    await this.inscriptionGateway.create(inscription);

    await Promise.all(
      input.members.map(async (member) => {
        const accountParticipantInEvent =
          AccountParticipantInEventEntity.create({
            accountParticipantId: member.accountParticipantId,
            inscriptionId: inscription.getId(),
            typeInscriptionId: member.typeInscriptionId,
          });

        await this.accountParticipantInEventGateway.create(
          accountParticipantInEvent,
        );
      }),
    );

    await this.eventGateway.incrementQuantityParticipants(
      eventExists.getId(),
      input.members.length,
    );

    // FASE 3: E-MAIL (após tudo inserido)
    await this.sendInscriptionNotificationEmail(
      eventExists.getId(),
      inscription,
      input.members.length,
    );

    return {
      id: inscription.getId(),
    };
  }

  /**
   * Envia e-mail de notificação de inscrição em grupo
   */
  private async sendInscriptionNotificationEmail(
    eventId: string,
    inscription: InscriptionEntity,
    participantCount: number,
  ): Promise<void> {
    try {
      const event = await this.eventGateway.findById(eventId);
      if (!event) {
        console.warn(`Evento ${eventId} não encontrado para envio de e-mail`);
        return;
      }

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(eventId);

      if (eventResponsibles.length === 0) {
        console.warn(`Evento ${eventId} não possui responsáveis cadastrados`);
        return;
      }

      const responsibleUsers = await Promise.all(
        eventResponsibles.map(async (responsible) => {
          const user = await this.userGateway.findById(
            responsible.getAccountId(),
          );
          return {
            id: responsible.getAccountId(),
            username: user?.getUsername() || 'Usuário não encontrado',
            email: user?.getEmail(),
          };
        }),
      );

      const accountUser = await this.userGateway.findById(
        inscription.getAccountId(),
      );

      const emailData = {
        eventName: event.getName(),
        eventImageUrl: event.getImageUrl(),
        responsibleName: inscription.getResponsible(),
        responsiblePhone: inscription.getPhone(),
        responsibleEmail: inscription.getEmail(),
        totalValue: inscription.getTotalValue(),
        participantCount,
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
      console.error(
        'Erro ao enviar e-mail de notificação de inscrição em grupo:',
        error,
      );
    }
  }
}
