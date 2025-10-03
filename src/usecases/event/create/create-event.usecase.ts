import { Inject, Injectable } from '@nestjs/common';
import { Event } from 'src/domain/entities/event.entity';
import type { EventGateway } from 'src/domain/repositories/event.gateway';

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject('EventGateway') private readonly eventGateway: EventGateway,
  ) {}

  async execute(input: {
    name: string;
    date: Date;
    regionId: string;
  }): Promise<Event> {
    // Regra: apenas ADMIN da region pode criar (validar no controller/guard)
    const event = Event.create(input);
    return this.eventGateway.create(event);
  }
}
