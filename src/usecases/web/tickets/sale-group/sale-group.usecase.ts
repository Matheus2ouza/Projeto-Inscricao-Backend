import { Injectable, Optional } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
  TicketSaleStatus,
  TransactionType,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';
import { InsufficientTicketsUsecaseException } from '../../exceptions/tickets/insufficient-tickets.usecase.exeception';
import { TicketNotFoundUsecaseException } from '../../exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleGrupInput = {
  eventId: string;
  accountId: string;
  name: string;
  userId?: string; // Opcional para compatibilidade
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
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly prisma: PrismaService,
    @Optional() private readonly syncQueue: SyncQueue,
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
        'An attempt was made to register a ticket sale, but the quantity was not reported',
        'Nenhum ticket informado para o registro da venda',
        SaleGrupUsecase.name,
      );
    }

    if (!input.payments.length) {
      throw new PaymentNotFoundUsecaseException(
        'Payment not informed for the sale',
        'Nenhum pagamento informado para a venda',
        SaleGrupUsecase.name,
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
        throw new InsufficientTicketsUsecaseException(
          'A quantidade do ticket deve ser maior que zero.',
          'A quantidade do ticket deve ser maior que zero.',
          SaleGrupUsecase.name,
        );
      }

      if (
        ticket.getExpirationDate() &&
        ticket.getExpirationDate() < new Date()
      ) {
        throw new TicketNotFoundUsecaseException(
          `Ticket ${ticket.getName()} has expired`,
          `O ticket: ${ticket.getName().toUpperCase()} já esta expirado.`,
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
        throw new PaymentNotFoundUsecaseException(
          'Payment value must be greater than zero.',
          'O valor do pagamento deve ser maior que zero.',
          SaleGrupUsecase.name,
        );
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
      throw new PaymentNotFoundUsecaseException(
        'The total value of payments must correspond to the value of the items.',
        'O valor total dos pagamentos precisa corresponder ao valor dos itens.',
        SaleGrupUsecase.name,
      );
    }

    const saleTotalValue = SaleGrupUsecase.centsToNumber(saleTotalCents);
    const totalUnits = normalizedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Criar a venda em memória
    const sale = TicketSale.create({
      eventId: input.eventId,
      name: input.name,
      status: TicketSaleStatus.PAID,
      totalValue: saleTotalValue,
    });

    // Criar pagamentos em memória
    const payments = normalizedPayments.map((payment) =>
      TicketSalePayment.create({
        ticketSaleId: sale.getId(),
        paymentMethod: payment.paymentMethod,
        value: payment.value,
      }),
    );

    // Criar itens da venda em memória
    const saleItems = normalizedItems.map((item) =>
      TicketSaleItem.create({
        ticketSaleId: sale.getId(),
        ticketId: item.ticketId,
        quantity: item.quantity,
        pricePerTicket: item.unitPrice,
        totalValue: item.totalValue,
      }),
    );

    // Buscar caixas do evento
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(input.eventId);

    // Criar entradas de caixa em memória
    const cashEntries =
      cashRegisterEvents.length > 0
        ? normalizedPayments.flatMap((payment) =>
            cashRegisterEvents.map((c) =>
              CashRegisterEntry.create({
                cashRegisterId: c.getCashRegisterId(),
                type: CashEntryType.INCOME,
                origin: CashEntryOrigin.TICKET,
                method: payment.paymentMethod,
                value: payment.value,
                description: `Venda de ticket ${sale.getId()} - ${input.name}`,
                eventId: event.getId(),
                ticketSaleId: sale.getId(),
                responsible: input.userId || 'system',
              }),
            ),
          )
        : [];

    // Atualizar caixas em memória
    const updatedCashRegisters = cashEntries.length
      ? await this.buildUpdatedCashRegisters(cashEntries)
      : [];

    // Criar movimentações financeiras
    const financialMovements = normalizedPayments.map((payment) =>
      FinancialMovement.create({
        eventId: event.getId(),
        accountId: input.accountId,
        type: TransactionType.INCOME,
        value: Decimal(payment.value),
      }),
    );

    // Atualizar o evento em memória
    event.addCollectedAmount(saleTotalValue);
    event.addNetValueCollected(saleTotalValue);

    // Executar tudo dentro da transação
    await this.prisma.runInTransaction(async (tx) => {
      // 1. Criar a venda
      await this.ticketSaleGateway.createTx(sale, tx);

      // 2. Criar pagamentos e associar movimentações financeiras
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const transaction = financialMovements[i];

        await this.financialMovementGateway.createTx(transaction, tx);
        payment.attachFinancialMovement(transaction.getId());
        await this.ticketSalePaymentGateway.createTx(payment, tx);
      }

      // 3. Criar os itens da venda
      for (const saleItem of saleItems) {
        await this.ticketSaleItemGateway.createTx(saleItem, tx);
      }

      // 4. Decrementar o estoque dos tickets
      for (const item of normalizedItems) {
        await this.eventTicketsGateway.decrementAvailableTx(
          item.ticketId,
          item.quantity,
          tx,
        );
      }

      // 5. Salvar entradas de caixa se existirem
      if (cashEntries.length) {
        await this.cashRegisterEntryGateway.createManyTx(cashEntries, tx);

        // Atualizar caixas
        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      }

      // 6. Atualizar evento
      await this.eventGateway.updateTx(event, tx);
    });

    // Adicionar jobs à fila de sincronização se estiver em modo evento
    if (process.env.EVENT_MODE === 'true') {
      // Sincronizar venda
      await this.syncQueue.enqueueJob({
        table: 'ticketSale',
        recordId: sale.getId(),
      });

      // Sincronizar pagamentos
      for (const payment of payments) {
        await this.syncQueue.enqueueJob({
          table: 'ticketSalePayment',
          recordId: payment.getId(),
        });
      }

      // Sincronizar itens da venda
      for (const saleItem of saleItems) {
        await this.syncQueue.enqueueJob({
          table: 'ticketSaleItem',
          recordId: saleItem.getId(),
        });
      }

      // Sincronizar movimentações financeiras
      for (const transaction of financialMovements) {
        await this.syncQueue.enqueueJob({
          table: 'financialMovement',
          recordId: transaction.getId(),
        });
      }

      // Sincronizar entradas de caixa
      for (const cashEntry of cashEntries) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegisterEntry',
          recordId: cashEntry.getId(),
        });
      }

      // Sincronizar caixas atualizados
      for (const cashRegister of updatedCashRegisters) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegister',
          recordId: cashRegister.getId(),
        });
      }

      // Sincronizar evento
      await this.syncQueue.enqueueJob({
        table: 'events',
        recordId: event.getId(),
      });
    }

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

  private async buildUpdatedCashRegisters(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    const deltaMap = new Map<string, number>();

    // Para vendas, sempre será INCOME, então simplificamos
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      const delta = entry.getValue();
      deltaMap.set(id, (deltaMap.get(id) ?? 0) + delta);
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta === 0) continue;

      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;

      // Como é venda, sempre incrementa o saldo
      cashRegister.incrementBalance(delta);
      updated.push(cashRegister);
    }

    return updated;
  }
}
