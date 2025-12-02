import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account.entity';
import { Event } from 'src/domain/entities/event.entity';
import { Region } from 'src/domain/entities/region.entity';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { AccountPrismaModelToUserEntityMapper } from '../account/model/mappers/account-prisma-model-to-account-entity.mapper';
import { EventPrismaModelToEventEntityMapper } from '../event/model/mappers/event-prisma-model-to-event-entity.mapper';
import { PrismaService } from '../prisma.service';
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

  async findAll(): Promise<Region[]> {
    const found = await this.prisma.regions.findMany({
      select: {
        id: true,
        name: true,
        outstandingBalance: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            events: true,
            accounts: true,
          },
        },
      },
    });
    return found.map(RegionPrismaModelToRegionEntityMapper.map);
  }

  async lastEventAt(regionId: string): Promise<Event | null> {
    const found = await this.prisma.events.findFirst({
      where: { regionId },
      orderBy: { createdAt: 'desc' },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async nextEventAt(regionId: string): Promise<Event | null> {
    const found = await this.prisma.events.findFirst({
      where: { regionId },
      orderBy: { createdAt: 'asc' },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async lastAccountAt(regionId: string): Promise<Account | null> {
    const found = await this.prisma.accounts.findFirst({
      where: { regionId },
      orderBy: { createdAt: 'desc' },
    });
    return found ? AccountPrismaModelToUserEntityMapper.map(found) : null;
  }
}
