import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { Usecase } from 'src/usecases/usecase';
import { TicketNotFoundUsecaseException } from 'src/usecases/web/exceptions/tickets/ticket-not-found.usecase.exception';

export type FindTicketDetailsInput = {
  eventTicketId: string;
};

export type FindTicketDetailsOutput = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  expirationDate: Date;
  isActive: boolean;
  TicketSaleItens: TicketSaleItens[];
};

export type TicketSaleItens = {
  id: string;
  quantity: number;
  createdAt: Date;
};

@Injectable()
export class FindTicketDetailsUsecase
  implements Usecase<FindTicketDetailsInput, FindTicketDetailsOutput>
{
  public constructor(
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
  ) {}

  async execute(
    input: FindTicketDetailsInput,
  ): Promise<FindTicketDetailsOutput> {
    const ticket = await this.eventTicketsGateway.findById(input.eventTicketId);

    if (!ticket) {
      throw new TicketNotFoundUsecaseException(
        `Attempt to fetch ticket details but Event Ticket was not found, ticketId: ${input.eventTicketId}`,
        'Ticket não encontrado',
        FindTicketDetailsUsecase.name,
      );
    }

    const ticketSaleItens = await this.ticketSaleItemGateway.findByTicketSaleId(
      ticket.getId(),
    );

    return {
      id: ticket.getId(),
      name: ticket.getName(),
      description: ticket.getDescription() ?? '',
      quantity: ticket.getQuantity(),
      price: ticket.getPrice(),
      available: ticket.getAvailable(),
      expirationDate: ticket.getExpirationDate(),
      isActive: ticket.getIsActive(),
      TicketSaleItens: ticketSaleItens.map((item) => ({
        id: item.getId(),
        quantity: item.getQuantity(),
        createdAt: item.getCreatedAt(),
      })),
    };
  }
}
