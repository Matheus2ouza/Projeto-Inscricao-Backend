import { Injectable } from '@nestjs/common';
import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { RedisService } from 'src/infra/services/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export type IndivUploadValidateInput = {
  responsible: string;
  email: string;
  phone: string;
  eventId: string;
  accountId: string;
  participant: {
    name: string;
    birthDateStr: string;
    gender: string;
    typeDescriptionId: string;
  };
};

export type IndivUploadValidateOutput = {
  cacheKey: string;
  participant: {
    name: string;
    birthDate: string;
    gender: string;
    typeDescription: string;
    value: number;
  };
};

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

@Injectable()
export class IndivUploadValidateUsecase {
  private static readonly CACHE_TTL_SECONDS = 60 * 60; // 60min

  constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly redis: RedisService,
  ) {}

  async execute(
    input: IndivUploadValidateInput,
  ): Promise<IndivUploadValidateOutput> {
    const { participant } = input;

    const nameParts = participant.name
      ?.trim()
      .split(/\s+/)
      .filter(
        (word) =>
          !['de', 'da', 'do', 'dos', 'das', 'e'].includes(word.toLowerCase()),
      );

    const hasValidName = nameParts && nameParts.length >= 2;

    if (!hasValidName) {
      throw new Error('O participante deve ter nome e sobrenome válidos');
    }

    // valida data nascimento formato DD/MM/AAAA
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(participant.birthDateStr)) {
      throw new Error(
        'Data de nascimento inválida (esperado formato DD/MM/AAAA)',
      );
    }

    const [dd, mm, yyyy] = participant.birthDateStr.split('/').map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    if (
      date.getFullYear() !== yyyy ||
      date.getMonth() !== mm - 1 ||
      date.getDate() !== dd
    ) {
      throw new Error('Data de nascimento inválida');
    }
    const birthDateISO = date.toISOString();

    // valida gênero
    if (!participant.gender) {
      throw new Error('Gênero é obrigatório');
    }
    if (!['MASCULINO', 'FEMININO'].includes(participant.gender.toUpperCase())) {
      throw new Error(
        `Gênero inválido: ${participant.gender}. Deve ser MASCULINO ou FEMININO`,
      );
    }

    // valida tipo de inscrição existente para o evento
    const types = await this.typeInscriptionGateway.findByEventId(
      input.eventId,
    );

    const found = types.find(
      (t) =>
        t.getId().toLowerCase().trim() ===
        participant.typeDescriptionId.toLowerCase().trim(),
    );

    if (!found) {
      throw new Error(
        `Tipo de inscrição não encontrado: ${participant.typeDescriptionId}`,
      );
    }

    const typeInscriptionId = found.getId();
    const typeValue = Number(found.getValue());
    const anTypeDescription = found.getDescription();

    // cria cache e registro
    const cacheKey = `indiv:inscription:${uuidv4()}`;
    const payload: CachePayload = {
      responsible: input.responsible,
      email: input.email,
      phone: input.phone,
      eventId: input.eventId,
      participant: {
        name: participant.name.trim(),
        birthDateISO,
        gender: participant.gender,
        typeInscriptionId,
        typeInscription: anTypeDescription,
        value: typeValue,
      },
    };

    await this.redis.setJson(
      cacheKey,
      payload,
      IndivUploadValidateUsecase.CACHE_TTL_SECONDS,
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + IndivUploadValidateUsecase.CACHE_TTL_SECONDS,
    );

    const cacheRecord = CacheRecord.create({
      cacheKey,
      payload,
      accountId: input.accountId,
      expiresAt,
    });

    await this.cacheRecordGateway.create(cacheRecord);

    return {
      cacheKey,
      participant: {
        name: participant.name.trim(),
        birthDate: new Date(birthDateISO).toLocaleDateString('pt-BR'),
        gender: participant.gender,
        typeDescription: anTypeDescription,
        value: typeValue,
      },
    };
  }
}
