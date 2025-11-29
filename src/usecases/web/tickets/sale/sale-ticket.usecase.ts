import { Injectable } from '@nestjs/common';
import { TicketSaleStatus } from 'generated/prisma';
import { Buffer } from 'node:buffer';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketPdfGenerator } from 'src/shared/utils/pdfs/ticket-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { InsufficientTicketsUsecaseException } from 'src/usecases/web/exceptions/tickets/insufficient-tickets.usecase.exeception';
import { TicketNotFoundUsecaseException } from 'src/usecases/web/exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleTicketInput = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  totalValue: number;
  quantity: number;
};

export type SaleTicketOutput = {
  id: string;
  ticketQuantity: number; // nova quantidade disponível
  ticketPdfBase64: string;
};

@Injectable()
export class SaleTicketUsecase
  implements Usecase<SaleTicketInput, SaleTicketOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventTicketGateway: EventTicketsGateway,
  ) {}

  async execute(input: SaleTicketInput): Promise<SaleTicketOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new TicketNotFoundUsecaseException(
        `Attempt to register ticket sale but Event was not found, eventId: ${input.eventId}`,
        `Evento não encontrado`,
        SaleTicketUsecase.name,
      );
    }

    const ticket = await this.eventTicketGateway.findById(event.getId());

    if (!ticket) {
      throw new TicketNotFoundUsecaseException(
        `Attempt to register ticket sale but Event Ticket was not found, eventId: ${input.eventId}`,
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
      eventId: ticket.getEventId(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: TicketSaleStatus.UNDER_REVIEW,
      totalValue: input.totalValue,
    });

    // Executa as operações em paralelo com await
    const [createdSale, updatedTicket] = await Promise.all([
      this.ticketSaleGateway.create(sale),
      this.eventTicketGateway.decrementAvailable(
        ticket.getId(),
        input.quantity,
      ),
    ]);

    const pdfBytes = await TicketPdfGenerator.generate({
      ticketId: ticket.getId(),
      ticketName: ticket.getName(),
      quantity: input.quantity,
      saleDate: createdSale.getCreatedAt(),
    });

    const ticketPdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const output: SaleTicketOutput = {
      id: createdSale.getId(),
      ticketQuantity: updatedTicket.getAvailable(),
      ticketPdfBase64,
    };

    return output;
  }
}
