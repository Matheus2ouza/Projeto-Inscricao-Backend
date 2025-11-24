import { Injectable } from '@nestjs/common';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InsufficientTicketsUsecaseException } from 'src/usecases/web/exceptions/tickets/insufficient-tickets.usecase.exeception';
import { TicketNotFoundUsecaseException } from 'src/usecases/web/exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleGroupTicketInput = {
  ticketId: string;
  accountId: string;
  quantity: number;
  pricePerTicket: number;
};

export type SaleGroupTicketOutput = {
  id: string;
};

@Injectable()
export class SaleGroupTicketUsecase
  implements Usecase<SaleGroupTicketInput, SaleGroupTicketOutput>
{
  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventTicketGateway: EventTicketsGateway,
  ) {}

  async execute(input: SaleGroupTicketInput): Promise<SaleGroupTicketOutput> {
    const eventTicketId = input.ticketId;
    const ticket = await this.eventTicketGateway.findById(eventTicketId);

    if (!ticket) {
      throw new TicketNotFoundUsecaseException(
        `Attempt to register ticket sale but Event Ticket was not found, eventId: ${input.ticketId}`,
        `Ticket não encontrado`,
        SaleGroupTicketUsecase.name,
      );
    }

    if (ticket.getAvailable() < input.quantity) {
      throw new InsufficientTicketsUsecaseException(
        `Attempted to sell ${input.quantity} tickets, but only ${ticket.getAvailable()} are available`,
        `Quantidade insuficiente de tickets disponíveis`,
        SaleGroupTicketUsecase.name,
      );
    }

    const sale = TicketSale.create({
      ticketId: input.ticketId,
      accountId: input.accountId,
      quantity: input.quantity,
      pricePerTicket: input.pricePerTicket,
    });

    const [createdSale] = await Promise.all([
      this.ticketSaleGateway.create(sale),
      this.eventTicketGateway.UpdateAvailable(ticket.getId(), input.quantity),
    ]);

    return {
      id: createdSale.getId(),
    };
  }
}
