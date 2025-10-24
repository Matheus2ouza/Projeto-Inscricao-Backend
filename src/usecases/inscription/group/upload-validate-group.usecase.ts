import { Injectable } from '@nestjs/common';
import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { RedisService } from 'src/infra/services/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export type UploadValidateGroupInput = {
  responsible: string;
  email: string;
  phone: string;
  eventId: string;
  accountId: string;
  rows: {
    line: number;
    name: string;
    birthDateStr: string;
    gender: string;
    typeDescription: string;
  }[];
};

export type UploadValidateGroupOutput = {
  cacheKey: string;
  total: number;
  status: 'PENDING' | 'UNDER_REVIEW';
  items: {
    name: string;
    birthDate: string;
    gender: string;
    typeDescription: string;
    value: number;
  }[];
};

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
    typeDescription: string;
    value: number;
  }[];
  total: number;
};

@Injectable()
export class UploadValidateGroupUsecase {
  private static readonly CACHE_TTL_SECONDS = 60 * 60; // 60min

  constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly redis: RedisService,
  ) {}

  async execute(
    input: UploadValidateGroupInput,
  ): Promise<UploadValidateGroupOutput> {
    const errors: { line: number; reason: string }[] = [];
    const normalized: CachePayload['items'] = [];
    let hasReviewType = false;

    for (const row of input.rows) {
      // valida nome: nome e sobrenome
      const hasTwoNames = row.name && row.name.trim().split(/\s+/).length >= 2;
      if (!hasTwoNames)
        errors.push({
          line: row.line,
          reason: 'Nome deve conter nome e sobrenome',
        });

      // valida data nascimento formato DD/MM/AAAA
      let birthDateISO = '';
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.birthDateStr)) {
        errors.push({
          line: row.line,
          reason: 'Data de nascimento em formato inválido (DD/MM/AAAA)',
        });
      } else {
        const [dd, mm, yyyy] = row.birthDateStr.split('/').map(Number);
        const date = new Date(yyyy, mm - 1, dd);
        if (
          date.getFullYear() !== yyyy ||
          date.getMonth() !== mm - 1 ||
          date.getDate() !== dd
        ) {
          errors.push({
            line: row.line,
            reason: 'Data de nascimento inválida',
          });
        } else {
          birthDateISO = date.toISOString();
        }
      }

      // valida gênero
      let gender = '';
      if (!row.gender) {
        errors.push({ line: row.line, reason: 'Gênero vazio' });
      } else if (!['MASCULINO', 'FEMININO'].includes(row.gender)) {
        errors.push({
          line: row.line,
          reason: `Gênero inválido: ${row.gender}. Deve ser MASCULINO ou FEMININO`,
        });
      } else {
        gender = row.gender;
      }

      // valida tipo de inscrição existente para o evento
      let typeInscriptionId: string | null = null;
      let typeValue = 0;
      let isExemptType = false;
      let isServiceType = false;

      if (!row.typeDescription) {
        errors.push({ line: row.line, reason: 'Tipo de inscrição vazio' });
      } else {
        const types = await this.typeInscriptionGateway.findByEventId(
          input.eventId,
        );
        const found = types.find(
          (t) =>
            t.getDescription().toLowerCase().trim() ===
            row.typeDescription.toLowerCase().trim(),
        );
        if (!found) {
          errors.push({
            line: row.line,
            reason: `Tipo de inscrição não encontrado: ${row.typeDescription}`,
          });
        } else {
          typeInscriptionId = found.getId();
          typeValue = Number(found.getValue());

          const normalizedType = row.typeDescription.toLowerCase().trim();
          isExemptType = normalizedType === 'isento';
          isServiceType = normalizedType === 'serviço';

          // Marca se for isento ou serviço → vai para revisão
          if (isExemptType || isServiceType) {
            hasReviewType = true;
          }
        }
      }

      if (hasTwoNames && birthDateISO && gender && typeInscriptionId) {
        normalized.push({
          name: row.name.trim(),
          birthDateISO,
          gender,
          typeInscriptionId,
          typeDescription: row.typeDescription.trim(),
          value: typeValue,
        });
      }
    }

    if (errors.length > 0) {
      const err = new Error(
        JSON.stringify(
          { message: 'Erros de validação encontrados', errors },
          null,
          2,
        ),
      );
      throw err; // capturado pelo controller e devolvido como 400
    }

    const total = normalized.reduce((sum, i) => sum + i.value, 0);
    const cacheKey = `group:inscription:${uuidv4()}`;
    const payload: CachePayload = {
      responsible: input.responsible,
      email: input.email,
      phone: input.phone,
      eventId: input.eventId,
      items: normalized,
      total,
    };

    // Salvar no Redis
    await this.redis.setJson(
      cacheKey,
      payload,
      UploadValidateGroupUsecase.CACHE_TTL_SECONDS,
    );

    // Salvar no banco de dados
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + UploadValidateGroupUsecase.CACHE_TTL_SECONDS,
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
      total,
      status: hasReviewType ? 'UNDER_REVIEW' : 'PENDING',
      items: normalized.map((i) => ({
        name: i.name,
        birthDate: new Date(i.birthDateISO).toLocaleDateString('pt-BR'),
        gender: i.gender,
        typeDescription: i.typeDescription,
        value: i.value,
      })),
    };
  }
}
