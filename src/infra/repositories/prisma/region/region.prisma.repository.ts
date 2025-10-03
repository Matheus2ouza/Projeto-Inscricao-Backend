import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Region } from 'src/domain/entities/region.entity';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import RegionPrismaModel from './model/region.prisma.model';
import { RegionEntityToRegionPrismaModelMapper } from './model/mappers/region-entity-to-region-prisma-model.mapper';
import { RegionPrismaModelToRegionEntityMapper } from './model/mappers/region-prisma-model-to-region-entity.mapper';

@Injectable()
export class RegionPrismaRepository implements RegionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(region: Region): Promise<Region> {
    const data = RegionEntityToRegionPrismaModelMapper.map(region);
    const created = await this.prisma.regions.create({ data });
    return RegionPrismaModelToRegionEntityMapper.map(created);
  }

  async findById(id: string): Promise<Region | null> {
    const found = await this.prisma.regions.findUnique({ where: { id } });
    return found ? RegionPrismaModelToRegionEntityMapper.map(found) : null;
  }

  async findByName(name: string): Promise<Region | null> {
    const found = await this.prisma.regions.findUnique({ where: { name } });
    return found ? RegionPrismaModelToRegionEntityMapper.map(found) : null;
  }
}
