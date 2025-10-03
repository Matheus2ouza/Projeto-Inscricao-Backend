import { Event } from '../entities/event.entity';

export interface EventGateway {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findByRegion(regionId: string): Promise<Event[]>;
}
