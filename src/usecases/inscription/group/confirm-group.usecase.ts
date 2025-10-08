import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infra/services/redis/redis.service';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Inscription, InscriptionStatus } from 'generated/prisma';
import { Inscription as InscriptionEntity } from 'src/domain/entities/inscription.entity';
import { Participant as ParticipantEntity } from 'src/domain/entities/participant.entity';

type CachePayload = {
  responsible: string;
  phone: string;
  eventId: string;
  items: {
    name: string;
    birthDateISO: string;
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
  totalParticipants: number;
};

@Injectable()
export class ConfirmGroupUsecase {
  constructor(
    private readonly redis: RedisService,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  async execute(input: ConfirmGroupInput): Promise<ConfirmGroupOutput> {
    const cached = await this.redis.getJson<CachePayload>(input.cacheKey);
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
        gender: 'N/A',
      });
      await this.participantGateway.create(participant);
    }

    // opcionalmente remover do cache
    await this.redis.del(input.cacheKey);

    return {
      inscriptionId: createdInscription.getId(),
      totalParticipants: cached.items.length,
    };
  }
}
