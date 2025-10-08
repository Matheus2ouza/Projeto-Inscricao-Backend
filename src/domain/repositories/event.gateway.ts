import { Event } from '../entities/event.entity';

export abstract class EventGateway {
  abstract create(event: Event): Promise<Event>;
  abstract findById(id: string): Promise<Event | null>;
  abstract findByRegion(regionId: string): Promise<Event[]>;
  abstract findByNameAndRegionId(
    name: string,
    regionId: string,
  ): Promise<Event | null>;
  abstract update(event: Event): Promise<Event>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(): Promise<Event[]>;
  abstract countTypesInscriptions(id: string): Promise<number>;
}
