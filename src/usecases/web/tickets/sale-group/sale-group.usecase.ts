import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  PaymentMethod,
  TicketSaleStatus,
  TransactionType,
} from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TicketNotFoundUsecaseException } from '../../exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleGrupInput = {
  eventId: string;
  accountId: string;
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

export type SaleGrupOutput = {
  saleId: string;
  totalUnits: number;
};

@Injectable()
export class SaleGrupUsecase implements Usecase<SaleGrupInput, SaleGrupOutput> {
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  public async execute(input: SaleGrupInput): Promise<SaleGrupOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        SaleGrupUsecase.name,
      );
    }

    if (!input.items.length) {
      throw new TicketNotFoundUsecaseException(
        'Nenhum ticket informado.',
        'Nenhum ticket informado.',
        SaleGrupUsecase.name,
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
          SaleGrupUsecase.name,
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
          SaleGrupUsecase.name,
        );
      }

      if (ticket.getAvailable() < item.quantity) {
        throw new TicketNotFoundUsecaseException(
          `Insufficient stock for ticketId: ${item.ticketId}. Requested ${item.quantity}, available ${ticket.getAvailable()}`,
          `Quantidade insuficiente do ticket ${ticket.getName()}`,
          SaleGrupUsecase.name,
        );
      }

      const unitPriceCents = SaleGrupUsecase.toCents(ticket.getPrice());
      const totalValueCents = unitPriceCents * item.quantity;

      return {
        ticketId: item.ticketId,
        ticketName: ticket.getName(),
        quantity: item.quantity,
        unitPrice: SaleGrupUsecase.centsToNumber(unitPriceCents),
        totalValue: SaleGrupUsecase.centsToNumber(totalValueCents),
      };
    });

    const normalizedPayments = input.payments.map((payment) => {
      if (payment.value <= 0) {
        throw new Error('O valor do pagamento deve ser maior que zero.');
      }

      return {
        paymentMethod: payment.paymentMethod,
        value: SaleGrupUsecase.centsToNumber(
          SaleGrupUsecase.toCents(payment.value),
        ),
      };
    });

    const saleTotalCents = normalizedItems.reduce(
      (sum, item) => sum + SaleGrupUsecase.toCents(item.totalValue),
      0,
    );

    const paymentsTotalCents = normalizedPayments.reduce(
      (sum, payment) => sum + SaleGrupUsecase.toCents(payment.value),
      0,
    );

    if (paymentsTotalCents !== saleTotalCents) {
      throw new Error(
        'O valor total dos pagamentos precisa corresponder ao valor dos itens.',
      );
    }

    const saleTotalValue = SaleGrupUsecase.centsToNumber(saleTotalCents);
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

    const transaction = FinancialMovement.create({
      eventId: event.getId(),
      accountId: input.accountId,
      type: TransactionType.INCOME,
      value: Decimal(saleTotalValue),
    });

    await this.financialMovementGateway.create(transaction);

    return {
      saleId: sale.getId(),
      totalUnits,
    };
  }

  private static toCents(value: number) {
    return Math.round(value * 100);
  }

  private static centsToNumber(cents: number) {
    return Number((cents / 100).toFixed(2));
  }
}
