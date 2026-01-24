import { Injectable } from '@nestjs/common';
import { PaymentMethod, TicketSaleStatus } from 'generated/prisma';
import { Buffer } from 'node:buffer';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { MiniTicketPdfGenerator } from 'src/shared/utils/pdfs/tickets/mini-ticket-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TicketNotFoundUsecaseException } from '../../exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleTicketInput = {
  eventId: string;
  name: string;
  items: TicketSaleItemInput[];
  payments: TicketSalePaymentInput[];
};

export type TicketSaleItemInput = {
  ticketId: string;
  quantity: number;
};

export type TicketSalePaymentInput = {
  paymentMethod: PaymentMethod;
  value: number;
};

export type SaleTicketOutput = {
  saleId: string;
  totalUnits: number;
  pdfBase64: string;
};

@Injectable()
export class SaleTicketUsecase
  implements Usecase<SaleTicketInput, SaleTicketOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
  ) {}

  async execute(input: SaleTicketInput): Promise<SaleTicketOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        SaleTicketUsecase.name,
      );
    }

    if (!input.items.length) {
      throw new TicketNotFoundUsecaseException(
        'Nenhum ticket informado.',
        'Nenhum ticket informado.',
        SaleTicketUsecase.name,
      );
    }

    if (!input.payments.length) {
      throw new Error(
        'Ao menos um pagamento é necessário para concluir a venda.',
      );
    }

    const ticketIds = [...new Set(input.items.map((item) => item.ticketId))];
    const tickets = await this.eventTicketsGateway.findByIds(ticketIds);
    const ticketMap = new Map(
      tickets.map((ticket) => [ticket.getId(), ticket]),
    );

    const normalizedItems = input.items.map((item) => {
      const ticket = ticketMap.get(item.ticketId);

      if (!ticket) {
        throw new TicketNotFoundUsecaseException(
          `Ticket not found with ticketId: ${item.ticketId}`,
          `Ticket não encontrado.`,
          SaleTicketUsecase.name,
        );
      }

      if (item.quantity <= 0) {
        throw new Error('A quantidade do ticket deve ser maior que zero.');
      }

      if (
        ticket.getExpirationDate() &&
        ticket.getExpirationDate() < new Date()
      ) {
        throw new TicketNotFoundUsecaseException(
          `Ticket ${ticket.getName()} has expired`,
          `Ticket expirado.`,
          SaleTicketUsecase.name,
        );
      }

      if (ticket.getAvailable() < item.quantity) {
        throw new TicketNotFoundUsecaseException(
          `Insufficient stock for ticketId: ${item.ticketId}. Requested ${item.quantity}, available ${ticket.getAvailable()}`,
          `Quantidade insuficiente do ticket ${ticket.getName()}`,
          SaleTicketUsecase.name,
        );
      }

      const unitPriceCents = SaleTicketUsecase.toCents(ticket.getPrice());
      const totalValueCents = unitPriceCents * item.quantity;

      return {
        ticketId: item.ticketId,
        ticketName: ticket.getName(),
        quantity: item.quantity,
        unitPrice: SaleTicketUsecase.centsToNumber(unitPriceCents),
        totalValue: SaleTicketUsecase.centsToNumber(totalValueCents),
      };
    });

    const normalizedPayments = input.payments.map((payment) => {
      if (payment.value <= 0) {
        throw new Error('O valor do pagamento deve ser maior que zero.');
      }

      return {
        paymentMethod: payment.paymentMethod,
        value: SaleTicketUsecase.centsToNumber(
          SaleTicketUsecase.toCents(payment.value),
        ),
      };
    });

    const saleTotalCents = normalizedItems.reduce(
      (sum, item) => sum + SaleTicketUsecase.toCents(item.totalValue),
      0,
    );

    const paymentsTotalCents = normalizedPayments.reduce(
      (sum, payment) => sum + SaleTicketUsecase.toCents(payment.value),
      0,
    );

    if (paymentsTotalCents !== saleTotalCents) {
      throw new Error(
        'O valor total dos pagamentos precisa corresponder ao valor dos itens.',
      );
    }

    const saleTotalValue = SaleTicketUsecase.centsToNumber(saleTotalCents);
    const totalUnits = normalizedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const sale = TicketSale.create({
      eventId: input.eventId,
      name: input.name,
      status: TicketSaleStatus.PAID,
      totalValue: saleTotalValue,
    });

    await this.ticketSaleGateway.create(sale);

    for (const payment of normalizedPayments) {
      const paymentEntity = TicketSalePayment.create({
        ticketSaleId: sale.getId(),
        paymentMethod: payment.paymentMethod,
        value: payment.value,
      });

      await this.ticketSalePaymentGateway.create(paymentEntity);
    }

    for (const item of normalizedItems) {
      const saleItem = TicketSaleItem.create({
        ticketSaleId: sale.getId(),
        ticketId: item.ticketId,
        quantity: item.quantity,
        pricePerTicket: item.unitPrice,
        totalValue: item.totalValue,
      });

      await this.ticketSaleItemGateway.create(saleItem);

      await this.eventTicketsGateway.decrementAvailable(
        item.ticketId,
        item.quantity,
      );
    }

    const ticketEntries = normalizedItems.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        ticketId: item.ticketId,
        ticketName: item.ticketName,
      })),
    );

    const pdfBytes = await MiniTicketPdfGenerator.generate({
      eventName: event.getName(),
      saleId: sale.getId(),
      buyerName: input.name,
      saleDate: new Date(),
      tickets: ticketEntries,
    });

    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // Incrementa o valor coletado do evento
    await this.eventGateway.incrementAmountCollected(
      input.eventId,
      saleTotalValue,
    );

    return {
      saleId: sale.getId(),
      totalUnits,
      pdfBase64,
    };
  }

  private static toCents(value: number) {
    return Math.round(value * 100);
  }

  private static centsToNumber(cents: number) {
    return Number((cents / 100).toFixed(2));
  }
}
