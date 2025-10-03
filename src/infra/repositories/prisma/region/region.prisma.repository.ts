import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Region } from 'src/domain/entities/region.entity';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
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
    const found = await this.prisma.regions.findMany({ where: { name } });
    if (!found.length) return null;
    return RegionPrismaModelToRegionEntityMapper.map(found[0]);
  }

  async findAllNames(): Promise<Region[]> {
    const found = await this.prisma.regions.findMany({
      select: { id: true, name: true },
    });
    return found.map(RegionPrismaModelToRegionEntityMapper.map);
  }
}
