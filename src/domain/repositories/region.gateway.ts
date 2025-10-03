import { Region } from '../entities/region.entity';

export abstract class RegionGateway {
  abstract create(region: Region): Promise<Region>;
  abstract findById(id: string): Promise<Region | null>;
  abstract findByName(name: string): Promise<Region | null>;
  abstract findAllNames(): Promise<Region[]>;
}
