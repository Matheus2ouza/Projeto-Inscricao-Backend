import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
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
};

@Injectable()
export class FindTicketDetailsUsecase
  implements Usecase<FindTicketDetailsInput, FindTicketDetailsOutput>
{
  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
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

    const sales = await this.ticketSaleGateway.findByEventId(
      ticket.getEventId(),
    );

    const ticketSaleItems = await Promise.all(
      sales.map(async (sale) => ({
        id: sale.getId(),
        quantity: await this.ticketSaleItemGateway.countItemsByTicketSaleId(
          sale.getId(),
        ),
      })),
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
    };
  }
}
