import { Region } from '../entities/region.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

export abstract class RegionGateway {
  abstract create(region: Region): Promise<Region>;
  abstract findById(id: string): Promise<Region | null>;
  abstract findByName(name: string): Promise<Region | null>;
  abstract findAllNames(): Promise<Region[]>;
  abstract findAll(): Promise<Region[]>;
  abstract lastEventAt(regionId: string): Promise<Event | null>;
  abstract nextEventAt(regionId: string): Promise<Event | null>;
  abstract lastAccountAt(regionId: string): Promise<User | null>;
}
