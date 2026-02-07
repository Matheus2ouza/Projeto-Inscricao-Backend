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
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
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
  private readonly logger = new Logger(RegisterGroupInscriptionUsecase.name);
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
    // Verificar evento
    const eventExists = await this.eventGateway.findById(input.eventId);
    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create group inscription for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // Extrair IDs
    const memberIds = [
      ...new Set(input.members.map((m) => m.accountParticipantId)),
    ];
    const typeInscriptionIds = [
      ...new Set(input.members.map((m) => m.typeInscriptionId)),
    ];

    // Buscar membros em lote
    const accountParticipants =
      await this.accountParticipantGateway.findByIds(memberIds);

    const participantMap = new Map(
      accountParticipants.map((p) => [p.getId(), p]),
    );

    const missingMembers = memberIds.filter((id) => !participantMap.has(id));

    if (missingMembers.length > 0) {
      throw new MemberNotFoundUsecaseException(
        `attempt to create group inscription for members: ${missingMembers.join(', ')} but they were not found`,
        `Membros não encontrados: ${missingMembers.join(', ')}`,
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // Buscar tipos de inscrição em lote
    const typeInscriptions =
      await this.typeInscriptionGateway.findByIds(typeInscriptionIds);

    const typeMap = new Map(typeInscriptions.map((t) => [t.getId(), t]));

    const missingTypeInscriptions = typeInscriptionIds.filter(
      (id) => !typeMap.has(id),
    );

    if (missingTypeInscriptions.length > 0) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to create group inscription for type inscriptions: ${missingTypeInscriptions.join(', ')} but they were not found`,
        `Tipos de inscrição não encontrados: ${missingTypeInscriptions.join(', ')}`,
        RegisterGroupInscriptionUsecase.name,
      );
    }

    // Verificar se há inscrição especial
    const hasSpecialType = input.members.some((member) =>
      typeMap.get(member.typeInscriptionId)!.getSpecialType(),
    );

    // Soma continua considerando todos os valores, mesmo que nulos
    const totalValue = input.members.reduce((sum, member) => {
      const type = typeMap.get(member.typeInscriptionId)!;
      return sum + type.getValue();
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

    const participantLinks = input.members.map((member) =>
      AccountParticipantInEventEntity.create({
        accountParticipantId: member.accountParticipantId,
        inscriptionId: inscription.getId(),
        typeInscriptionId: member.typeInscriptionId,
      }),
    );

    await this.accountParticipantInEventGateway.createMany(participantLinks);

    void this.sendInscriptionNotificationEmail(
      eventExists.getId(),
      inscription,
      input.members.length,
    ).catch((error) => {
      this.logger.error(
        `(BG) Erro ao enviar email de inscrição em grupo para ${inscription.getEmail()}: ${error.message}`,
        error,
      );
    });

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
        this.logger.warn(
          `Evento ${eventId} não encontrado para envio de e-mail de inscrição em grupo`,
        );
        return;
      }

      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(eventId);

      if (eventResponsibles.length === 0) {
        this.logger.warn(
          `Evento ${eventId} não possui responsáveis cadastrados para envio de e-mail de inscrição em grupo`,
        );
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
      const accountId = inscription.getAccountId()!;

      if (!accountId) {
        this.logger.warn(
          `Inscrição ${inscription.getId()} não possui um ID de conta associado para envio de e-mail de inscrição em grupo`,
        );
        return;
      }

      const accountUser = await this.userGateway.findById(accountId);

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
      this.logger.error(
        `Erro ao enviar e-mail de notificação de inscrição em grupo ${inscription.getId()} para o evento ${eventId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
