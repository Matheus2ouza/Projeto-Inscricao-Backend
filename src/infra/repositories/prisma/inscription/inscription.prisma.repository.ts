import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PrismaService } from '../prisma.service';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { Injectable } from '@nestjs/common';
import { InscriptionEntityToInscriptionPrismaModelMapper as EntityToPrisma } from './model/mappers/inscription-entity-to-inscription-prisma-model.mapper';
import { InscriptionEntityToInscriptionPrismaModelMapper as PrismaToEntity } from './model/mappers/inscription-prisma-model-to-inscription-entity.mapper';

@Injectable()
export class InscriptionPrismaRepository implements InscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(inscription: Inscription): Promise<Inscription> {
    const data = EntityToPrisma.map(inscription);
    const created = await this.prisma.inscription.create({ data });
    return PrismaToEntity.map(created);
  }

  async findById(id: string): Promise<Inscription | null> {
    const found = await this.prisma.inscription.findUnique({ where: { id } });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByAccountId(accountId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { accountId },
    });
    return found.map(PrismaToEntity.map);
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.inscription.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async countAll(): Promise<number> {
    return this.prisma.inscription.count();
  }
}
