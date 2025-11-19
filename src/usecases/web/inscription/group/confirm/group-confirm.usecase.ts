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
  items: {
    name: string;
    birthDateISO: string;
    gender: string;
    typeInscriptionId: string;
    typeInscription: string;
    value: number;
  }[];
  total: number;
};

export type GroupConfirmInput = {
  cacheKey: string;
  accountId: string;
};

export type GroupConfirmOutput = {
  inscriptionId: string;
  inscriptionStatus: string;
  paymentEnabled: boolean;
};

@Injectable()
export class GroupConfirmUsecase {
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

  async execute(input: GroupConfirmInput): Promise<GroupConfirmOutput> {
    // Primeiro tenta buscar no banco de dados
    const cacheRecord = await this.cacheRecordGateway.findByCacheKey(
      input.cacheKey,
    );
    let cached: CachePayload | null = null;

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
    } else {
      // Fallback para Redis se não encontrar no banco
      cached = await this.redis.getJson<CachePayload>(input.cacheKey);
    }

    if (!cached) {
      throw new Error('Dados expiraram ou não foram encontrados');
    }

    // Busca tipos de inscrição para validar se algum é especial
    const typeInscriptionIds = Array.from(
      new Set(cached.items.map((item) => item.typeInscriptionId)),
    );
    const specialTypeEntries = await Promise.all(
      typeInscriptionIds.map(async (typeId) => {
        const typeInscription =
          await this.typeInscriptionGateway.findById(typeId);
        return [typeId, typeInscription?.getSpecialType() ?? false] as const;
      }),
    );
    const specialTypesMap = new Map(specialTypeEntries);
    const hasSpecialType = cached.items.some((item) =>
      specialTypesMap.get(item.typeInscriptionId),
    );
    const status = hasSpecialType
      ? InscriptionStatus.UNDER_REVIEW
      : InscriptionStatus.PENDING;

    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: cached.eventId,
      responsible: cached.responsible,
      phone: cached.phone,
      totalValue: cached.total,
      status,
      email: cached.email,
    });

    const createdInscription =
      await this.inscriptionGateway.create(inscription);

    for (const item of cached.items) {
      const participant = ParticipantEntity.create({
        inscriptionId: createdInscription.getId(),
        typeInscriptionId: item.typeInscriptionId,
        name: item.name,
        birthDate: new Date(item.birthDateISO),
        gender: item.gender as genderType,
      });
      await this.participantGateway.create(participant);
    }

    const paymentEnabledEvent = await this.eventGateway.paymentCheck(
      cached.eventId,
    );

    await this.eventGateway.incrementQuantityParticipants(
      cached.eventId,
      cached.items.length,
    );

    // Remover do cache (Redis e banco)
    await this.redis.del(input.cacheKey);
    await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);

    // Enviar e-mail de notificação para os responsáveis do evento
    await this.sendInscriptionNotificationEmail(
      cached.eventId,
      createdInscription,
      cached.items,
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
    participants: CachePayload['items'],
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

      // Preparar dados para o e-mail
      const emailData: InscriptionEmailData = {
        eventName: event.getName(),
        eventImageUrl: event.getImageUrl(),
        responsibleName: inscription.getResponsible(),
        responsiblePhone: inscription.getPhone(),
        responsibleEmail: inscription.getEmail(),
        totalValue: inscription.getTotalValue(),
        participantCount: participants.length,
        accountUsername: accountUser?.getUsername() || 'Usuário não encontrado',
        inscriptionDate: inscription.getCreatedAt(),
        eventStartDate: event.getStartDate(),
        eventEndDate: event.getEndDate(),
        eventLocation: event.getLocation(),
      };

      // Enviar e-mail
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
