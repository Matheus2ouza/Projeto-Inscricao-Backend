import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllTicketInput = {
  eventId: string;
};

export type FindAllTicketOutput = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}[];

@Injectable()
export class FindAllTicketsUsecase
  implements Usecase<FindAllTicketInput, FindAllTicketOutput>
{
  public constructor(
    private readonly eventTicketsGateway: EventTicketsGateway,
  ) {}

  async execute(input: FindAllTicketInput): Promise<FindAllTicketOutput> {
    const tickets = await this.eventTicketsGateway.findAll(input.eventId);

    // ✅ transforma entidades em DTO simples
    return tickets.map((ticket) => ({
      id: ticket.getId(),
      eventId: ticket.getEventId(),
      name: ticket.getName(),
      description: ticket.getDescription() ?? '',
      quantity: ticket.getQuantity(),
      price: ticket.getPrice(),
      available: ticket.getAvailable(),
      createdAt: ticket.getCreatedAt(),
      updatedAt: ticket.getUpdatedAt(),
    }));
  }
}
