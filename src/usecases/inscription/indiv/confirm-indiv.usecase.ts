import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { Participant as ParticipantEntity } from 'src/domain/entities/participant.entity';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { RedisService } from 'src/infra/services/redis/redis.service';

type CachePayload = {
  responsible: string;
  phone: string;
  eventId: string;
  participant: {
    name: string;
    birthDateISO: string;
    gender: string;
    typeInscriptionId: string;
    typeDescription: string;
    value: number;
  };
};

export type ConfirmIndivInput = {
  cacheKey: string;
  accountId: string;
};

export type ConfirmIndivOutput = {
  inscriptionId: string;
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
  ) {}

  async execute(input: ConfirmIndivInput): Promise<ConfirmIndivOutput> {
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

    // Verifica se o tipo de inscrição é "isento" para definir o status
    const isExemptType =
      cached.participant.typeDescription.toLowerCase().trim() === 'isento';
    const status = isExemptType
      ? InscriptionStatus.UNDER_REVIEW
      : InscriptionStatus.PENDING;

    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: cached.eventId,
      responsible: cached.responsible,
      phone: cached.phone,
      totalValue: cached.participant.value,
      status,
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

    await this.eventGateway.updateQuantityParticipants(cached.eventId, 1);
    // Remover do cache (Redis e banco)
    await this.redis.del(input.cacheKey);
    await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);

    return {
      inscriptionId: createdInscription.getId(),
      paymentEnabled: paymentEnabledEvent,
    };
  }
}
