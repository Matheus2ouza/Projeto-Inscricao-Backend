import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { Participant as ParticipantEntity } from 'src/domain/entities/participant.entity';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { InscriptionEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-email.handler';
import { InscriptionEmailData } from 'src/infra/services/mail/types/inscription/inscription-email.types';
import { RedisService } from 'src/infra/services/redis/redis.service';

type CachePayload = {
  responsible: string;
  email: string;
  phone: string;
  eventId: string;
  participant: {
    name: string;
    birthDateISO: string;
    gender: string;
    typeInscriptionId: string;
    typeInscription: string;
    value: number;
  };
};

export type IndivConfirmInput = {
  cacheKey: string;
  accountId: string;
};

export type IndivConfirmOutput = {
  inscriptionId: string;
  inscriptionStatus: string;
  paymentEnabled: boolean;
};

@Injectable()
export class IndivConfirmUsecase {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: UserGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly inscriptionEmailHandler: InscriptionEmailHandler,
  ) {}

  async execute(input: IndivConfirmInput): Promise<IndivConfirmOutput> {
    // Primeiro tenta buscar no Redis
    let cached = await this.redis.getJson<CachePayload>(input.cacheKey);

    if (!cached) {
      // Fallback para banco de dados se não encontrar no Redis
      const cacheRecord = await this.cacheRecordGateway.findByCacheKey(
        input.cacheKey,
      );

      if (cacheRecord) {
        // Verificar se o cache pertence ao usuário
        if (cacheRecord.getAccountId() !== input.accountId) {
          throw new Error('Acesso negado ao cache');
        }

        // Verificar se o cache expirou
        if (cacheRecord.isExpired()) {
          await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);
          throw new Error('Cache expirado');
        }

        cached = cacheRecord.getPayload();
      }
    }

    if (!cached) {
      throw new Error('Dados expiraram ou não foram encontrados');
    }

    // Verifica se o tipo de inscrição é especial para definir o status
    const typeInscription = await this.typeInscriptionGateway.findById(
      cached.participant.typeInscriptionId,
    );
    const status = typeInscription?.getSpecialType()
      ? InscriptionStatus.UNDER_REVIEW
      : InscriptionStatus.PENDING;

    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: cached.eventId,
      responsible: cached.responsible,
      phone: cached.phone,
      totalValue: cached.participant.value,
      status,
      email: cached.email,
    });

    const createdInscription =
      await this.inscriptionGateway.create(inscription);

    const { participant } = cached;

    const anParticipant = ParticipantEntity.create({
      inscriptionId: createdInscription.getId(),
      typeInscriptionId: participant.typeInscriptionId,
      name: participant.name,
      birthDate: new Date(participant.birthDateISO),
      gender: participant.gender.toUpperCase() as genderType,
    });
    await this.participantGateway.create(anParticipant);

    const paymentEnabledEvent = await this.eventGateway.paymentCheck(
      cached.eventId,
    );

    await this.eventGateway.incrementQuantityParticipants(cached.eventId, 1);

    // Remover do cache (Redis e banco)
    await this.redis.del(input.cacheKey);
    await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);

    // Enviar e-mail de notificação para os responsáveis do evento
    await this.sendInscriptionNotificationEmail(
      cached.eventId,
      createdInscription,
      cached.participant,
    );

    return {
      inscriptionId: createdInscription.getId(),
      inscriptionStatus: createdInscription.getStatus(),
      paymentEnabled: paymentEnabledEvent,
    };
  }

  /**
   * Envia e-mail de notificação de inscrição para os responsáveis do evento
   */
  private async sendInscriptionNotificationEmail(
    eventId: string,
    inscription: InscriptionEntity,
    participant: CachePayload['participant'],
  ): Promise<void> {
    try {
      // Buscar dados do evento
      const event = await this.eventGateway.findById(eventId);
      if (!event) {
        console.warn(`Evento ${eventId} não encontrado para envio de e-mail`);
        return;
      }

      // Buscar responsáveis do evento
      const eventResponsibles =
        await this.eventResponsibleGateway.findByEventId(eventId);

      if (eventResponsibles.length === 0) {
        console.warn(`Evento ${eventId} não possui responsáveis cadastrados`);
        return;
      }

      // Buscar dados dos usuários responsáveis
      const responsibleUsers = await Promise.all(
        eventResponsibles.map(async (responsible) => {
          const user = await this.userGateway.findById(
            responsible.getAccountId(),
          );
          return {
            id: responsible.getAccountId(),
            username: user?.getUsername() || 'Usuário não encontrado',
            email: user?.getEmail(), // E-mail do responsável pelo evento
          };
        }),
      );

      // Buscar dados da conta que fez a inscrição
      const accountUser = await this.userGateway.findById(
        inscription.getAccountId(),
      );

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
      console.error(
        'Erro ao enviar e-mail de notificação de inscrição:',
        error,
      );
    }
  }
}
