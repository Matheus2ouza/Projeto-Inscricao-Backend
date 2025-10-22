import { Injectable } from '@nestjs/common';
import type { PaymentMethod } from 'generated/prisma';
import { Buffer } from 'node:buffer';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketPdfGenerator } from 'src/shared/utils/pdfs/ticket-pdf-generator.util';
import { InsufficientTicketsUsecaseException } from 'src/usecases/exceptions/tickets/insufficient-tickets.usecase.exeception';
import { TicketNotFoundUsecaseException } from 'src/usecases/exceptions/tickets/ticket-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type SaleTicketInput = {
  ticketId: string;
  accountId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  pricePerTicket: number;
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
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly eventTicketGateway: EventTicketsGateway,
  ) {}

  async execute(input: SaleTicketInput): Promise<SaleTicketOutput> {
    console.log('O input dentro do usecase');
    console.log(input);
    const eventTicketId = input.ticketId;
    const ticket = await this.eventTicketGateway.findById(eventTicketId);

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
      paymentMethod: input.paymentMethod,
      pricePerTicket: input.pricePerTicket,
    });

    // Executa as operações em paralelo com await
    const [createdSale, updatedTicket] = await Promise.all([
      this.ticketSaleGateway.create(sale),
      this.eventTicketGateway.UpdateAvailable(ticket.getId(), input.quantity),
    ]);

    const pdfBytes = await TicketPdfGenerator.generate({
      ticketId: ticket.getId(),
      ticketName: ticket.getName(),
      quantity: input.quantity,
      saleDate: createdSale.getCreatedAt(),
    });

    const ticketPdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // Retorna id da venda, nova quantidade disponível e PDF
    return {
      id: createdSale.getId(),
      ticketQuantity: updatedTicket.getAvailable(),
      ticketPdfBase64,
    };
  }
}
