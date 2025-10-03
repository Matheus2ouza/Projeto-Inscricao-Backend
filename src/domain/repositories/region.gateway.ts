import { Region } from '../entities/region.entity';

export interface RegionGateway {
  create(region: Region): Promise<Region>;
  findById(id: string): Promise<Region | null>;
  findByName(name: string): Promise<Region | null>;
}
