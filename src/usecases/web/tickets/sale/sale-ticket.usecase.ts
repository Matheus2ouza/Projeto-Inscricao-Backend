import { Injectable, Optional } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
  TicketSaleStatus,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TicketNotFoundUsecaseException } from '../../exceptions/tickets/ticket-not-found.usecase.exception';

export type SaleTicketInput = {
  userId: string;
  eventId: string;
  name: string;
  items: TicketSaleItemTypes[];
  payments: TicketSalePaymentTypes[];
};

export type TicketSaleItemTypes = {
  ticketId: string;
  quantity: number;
};

export type TicketSalePaymentTypes = {
  paymentMethod: PaymentMethod;
  value: number;
};

export type SaleTicketOutput = {
  saleId: string;
  totalUnits: number;
  eventName: string;
  buyerName: string;
  saleDate: string;
  totalValue: number;
  barcodes: string[];
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
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly prisma: PrismaService,
    @Optional() private readonly syncQueue: SyncQueue,
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

    // Criar a venda em memória
    const sale = TicketSale.create({
      eventId: event.getId(),
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
                responsible: input.userId,
              }),
            ),
          )
        : [];

    // Atualizar caixas em memória
    const updatedCashRegisters = cashEntries.length
      ? await this.buildUpdatedCashRegisters(cashEntries)
      : [];

    event.addCollectedAmount(saleTotalValue);
    event.addNetValueCollected(saleTotalValue);

    // REMOVIDO: Geração do PDF
    // Agora apenas geramos os códigos de barras
    const barcodes = this.generateBarcodes(sale.getId(), normalizedItems);

    // Executar tudo em transação
    await this.prisma.runInTransaction(async (tx) => {
      // Salvar venda
      await this.ticketSaleGateway.createTx(sale, tx);

      // Salvar pagamentos
      for (const payment of payments) {
        await this.ticketSalePaymentGateway.createTx(payment, tx);
      }

      // Salvar itens da venda
      for (const saleItem of saleItems) {
        await this.ticketSaleItemGateway.createTx(saleItem, tx);
      }

      // Decrementar estoque dos tickets
      for (const item of normalizedItems) {
        await this.eventTicketsGateway.decrementAvailableTx(
          item.ticketId,
          item.quantity,
          tx,
        );
      }

      // Salvar entradas de caixa se existirem
      if (cashEntries.length) {
        await this.cashRegisterEntryGateway.createManyTx(cashEntries, tx);

        // Atualizar caixas
        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      }

      // Atualizar evento
      await this.eventGateway.updateTx(event, tx);
    });

    // Somente para sincronização durante evento
    if (process.env.EVENT_MODE === 'true') {
      await this.syncQueue.enqueueJob({
        table: 'ticketSale',
        recordId: sale.getId(),
      });

      for (const payment of payments) {
        await this.syncQueue.enqueueJob({
          table: 'ticketSalePayment',
          recordId: payment.getId(),
        });
      }

      for (const saleItem of saleItems) {
        await this.syncQueue.enqueueJob({
          table: 'ticketSaleItem',
          recordId: saleItem.getId(),
        });
      }

      for (const cashEntry of cashEntries) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegisterEntry',
          recordId: cashEntry.getId(),
        });
      }

      for (const cashRegister of updatedCashRegisters) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegister',
          recordId: cashRegister.getId(),
        });
      }

      await this.syncQueue.enqueueJob({
        table: 'events',
        recordId: event.getId(),
      });
    }

    // Retornar dados estruturados com os códigos de barras
    return {
      saleId: sale.getId(),
      totalUnits,
      eventName: event.getName(),
      buyerName: input.name,
      saleDate: new Date().toISOString(),
      totalValue: saleTotalValue,
      barcodes,
    };
  }

  /**
   * Gera códigos de barras para cada ingresso vendido
   * @param saleId - ID da venda
   * @param items - Itens normalizados com ticketId e quantidade
   * @returns Array de strings com os códigos de barras
   */
  private generateBarcodes(
    saleId: string,
    items: Array<{
      ticketId: string;
      ticketName: string;
      quantity: number;
      unitPrice: number;
      totalValue: number;
    }>,
  ): string[] {
    const barcodes: string[] = [];
    const timestamp = Date.now().toString().slice(-6);
    const saleIdNum = saleId.replace(/\D/g, '').slice(-6);

    for (const item of items) {
      const ticketIdNum = item.ticketId.replace(/\D/g, '').slice(-4);

      for (let i = 0; i < item.quantity; i++) {
        const sequence = (i + 1).toString().padStart(2, '0');
        // Formato: SALE_ID(6) + TICKET_ID(4) + SEQUENCE(2) + TIMESTAMP(6) = 18 caracteres
        const barcode = `${saleIdNum}${ticketIdNum}${sequence}${timestamp}`;
        barcodes.push(barcode);
      }
    }

    return barcodes;
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

      if (delta > 0) {
        cashRegister.incrementBalance(delta);
      } else {
        cashRegister.decrementBalance(-delta);
      }

      updated.push(cashRegister);
    }
    return updated;
  }
}
