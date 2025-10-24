import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketNotFoundUsecaseException } from 'src/usecases/exceptions/tickets/ticket-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

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
  ticketSale: {
    id: string;
    quantity: number;
    totalValue: number;
  }[];
};

@Injectable()
export class FindTicketDetailsUsecase
  implements Usecase<FindTicketDetailsInput, FindTicketDetailsOutput>
{
  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
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

    const sales = await this.ticketSaleGateway.findByEventTicketId(
      ticket.getId(),
    );

    return {
      id: ticket.getId(),
      name: ticket.getName(),
      description: ticket.getDescription() ?? '',
      quantity: ticket.getQuantity(),
      price: ticket.getPrice(),
      available: ticket.getAvailable(),
      ticketSale: sales.map((sale) => ({
        id: sale.getId(),
        quantity: sale.getQuantity(),
        totalValue: sale.getTotalValue(),
      })),
    };
  }
}
