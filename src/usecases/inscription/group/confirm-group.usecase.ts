import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infra/services/redis/redis.service';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { genderType, Inscription, InscriptionStatus } from 'generated/prisma';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { Participant as ParticipantEntity } from 'src/domain/entities/participant.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';

type CachePayload = {
  responsible: string;
  phone: string;
  eventId: string;
  items: {
    name: string;
    birthDateISO: string;
    gender: string;
    typeInscriptionId: string;
    value: number;
  }[];
  total: number;
};

export type ConfirmGroupInput = {
  cacheKey: string;
  accountId: string;
};

export type ConfirmGroupOutput = {
  inscriptionId: string;
  paymentEnabled: boolean;
};

@Injectable()
export class ConfirmGroupUsecase {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  async execute(input: ConfirmGroupInput): Promise<ConfirmGroupOutput> {
    console.log(input.cacheKey);

    // Primeiro tenta buscar no banco de dados
    let cacheRecord = await this.cacheRecordGateway.findByCacheKey(
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

    const inscription = InscriptionEntity.create({
      accountId: input.accountId,
      eventId: cached.eventId,
      responsible: cached.responsible,
      phone: cached.phone,
      totalValue: cached.total,
      status: InscriptionStatus.PENDING,
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

    // Remover do cache (Redis e banco)
    await this.redis.del(input.cacheKey);
    await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);

    return {
      inscriptionId: createdInscription.getId(),
      paymentEnabled: paymentEnabledEvent,
    };
  }
}
