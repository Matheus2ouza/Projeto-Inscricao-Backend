import { Injectable } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateTicketInput = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
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
    });

    console.log('O ticket do entity');
    console.log(ticket);

    // ✅ passa a entidade completa para o gateway
    const created = await this.eventTicketsGateway.create(ticket);

    return { id: created.getId() };
  }
}
