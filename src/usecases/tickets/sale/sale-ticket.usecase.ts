import { StatusPayment } from 'generated/prisma';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { InsufficientTicketsUsecaseException } from 'src/usecases/exceptions/tickets/insufficient-tickets.usecase.exeception';
import { TicketNotFoundUsecaseException } from 'src/usecases/exceptions/tickets/ticket-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type SaleTicketInput = {
  ticketId: string;
  accountId: string;
  quantity: number;
  pricePerTicket: number;
  status: StatusPayment;
};

export type SaleTicketOutput = {
  id: string;
  ticketQuantity: number; // nova quantidade disponível
};

export class SaleTicketUsecase
  implements Usecase<SaleTicketInput, SaleTicketOutput>
{
  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventTicketGateway: EventTicketsGateway,
  ) {}

  async execute(input: SaleTicketInput): Promise<SaleTicketOutput> {
    const ticket = await this.eventTicketGateway.findById(input.ticketId);

    if (!ticket) {
      throw new TicketNotFoundUsecaseException(
        `Attempt to register ticket sale but Event Ticket was not found, eventId: ${input.ticketId}`,
        `Ticket não encontrado`,
        SaleTicketUsecase.name,
      );
    }

    if (ticket.getAvailable() < input.quantity) {
      throw new InsufficientTicketsUsecaseException(
        `Attempted to sell ${input.quantity} tickets, but only ${ticket.getAvailable()} are available`,
        `Quantidade insuficiente de tickets disponíveis`,
        SaleTicketUsecase.name,
      );
    }

    // Cria a venda
    const sale = TicketSale.create({
      ticketId: input.ticketId,
      accountId: input.accountId,
      quantity: input.quantity,
      pricePerTicket: input.pricePerTicket,
      status: input.status,
    });

    // Executa as operações em paralelo com await
    const [createdSale, updatedTicket] = await Promise.all([
      this.ticketSaleGateway.create(sale),
      this.eventTicketGateway.UpdateAvailable(ticket.getId(), input.quantity),
    ]);

    // Retorna id da venda e nova quantidade disponível
    return {
      id: createdSale.getId(),
      ticketQuantity: updatedTicket.getAvailable(),
    };
  }
}
