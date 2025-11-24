import { Injectable } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type CreateTicketInput = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  expirationDate: Date;
  isActive: boolean;
};

export type CreateTicketOutput = {
  id: string;
};

@Injectable()
export class CreateTicketUsecase
  implements Usecase<CreateTicketInput, CreateTicketOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempted to create ticket but event ID was invalid`,
        `id do evento inválido`,
        CreateTicketUsecase.name,
      );
    }

    const ticket = EventTicket.create({
      eventId: event.getId(),
      name: input.name,
      description: input.description,
      quantity: input.quantity,
      price: input.price,
      expirationDate: input.expirationDate,
      isActive: input.isActive,
    });

    const created = await this.eventTicketsGateway.create(ticket);

    const output: CreateTicketOutput = {
      id: created.getId(),
    };

    return output;
  }
}
