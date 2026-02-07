import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ReportGeneralInput = {
  eventId: string;
};

export type ReportGeneralOutput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  logo?: string;
  totalInscriptions: number;
  countTypeInscription: number;
  countParticipants: number;
  totalValue: number;
  totalDebt: number;

  typeInscriptions: TypeInscription;
  inscriptions: Inscription[];
  guestInscriptions: GuestInscription[];
  inscriptionAvuls: InscriptionAvuls;
  ticketSale: TicketSale;
  expenses: ExpensesReport;
  gastos: ExpensesReport;
};

type TypeInscription = {
  id: string;
  description: string;
  amount: number;
}[];

type Inscription = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: InscriptionPaymentMethodReport[];
};

type GuestInscription = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: GuestInscriptionPaymentMethodReport[];
};

type GuestInscriptionPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type InscriptionPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type InscriptionAvuls = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: AvulsoPaymentMethodReport[];
};

type AvulsoPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type TicketSale = {
  totalSales: number; // soma dos valores de todas as vendas de ticket
  totalTicketsSold: number; // soma das quantidades de todos os itens vendidos
  byTicket: TicketSaleByTicket[]; // agrupado por ticket
  byPaymentMethod: TicketSaleByPaymentMethod[]; // agrupado por método de pagamento
};

type TicketSaleByTicket = {
  ticketId: string;
  ticketName: string;
  quantity: number;
  totalValue: number;
};

type TicketSaleByPaymentMethod = {
  paymentMethod: PaymentMethod;
  count: number;
  totalValue: number;
};

type ExpensesReport = {
  total: number;
  totalDinheiro: number;
  totalPix: number;
  totalCartao: number;
  gastos: ExpenseDetail[];
};

type ExpenseDetail = {
  id: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ReportGeneralUsecase
  implements Usecase<ReportGeneralInput, ReportGeneralOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
  ) {}

  public async execute(
    input: ReportGeneralInput,
  ): Promise<ReportGeneralOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${ReportGeneralUsecase.name}`,
        `Evento não encontrado`,
        ReportGeneralUsecase.name,
      );
    }

    const image = await this.getPublicUrlOrEmpty(event.getImageUrl());

    const [
      inscriptions,
      total,
      typeInscriptions,
      totalDebt,
      avulsParticipantsCount,
      avulsPaymentTotals,
      avulsParticipantsPerMethod,
    ] = await Promise.all([
      this.inscriptionGateway.findInscriptionsWithPaid(event.getId()),
      this.inscriptionGateway.countAllByEvent(event.getId()),
      this.typeInscriptionGateway.findByEventId(event.getId()),
      this.inscriptionGateway.contTotalDebtByEvent(event.getId()),
      this.onSiteRegistrationGateway.countParticipantsByEventId(event.getId()),
      this.onSiteRegistrationGateway.sumPaymentsByMethod(event.getId()),
      this.onSiteRegistrationGateway.countParticipantsByPaymentMethod(
        event.getId(),
      ),
    ]);

    const [
      ticketSaleSummary,
      ticketSaleItems,
      ticketSalePayments,
      eventTickets,
      eventExpenses,
    ] = await Promise.all([
      this.ticketSaleGateway.getEventSalesSummary(event.getId()),
      this.ticketSaleItemGateway.findByEventId(event.getId()),
      this.ticketSalePaymentGateway.sumByEventId(event.getId()),
      this.eventTicketsGateway.findAll(event.getId()),
      this.eventExpensesGateway.findMany(event.getId()),
    ]);

    const inscriptionIds = inscriptions.map((i) => i.getId());

    const normalInscriptionIdSet = new Set<string>();
    const guestInscriptionIdSet = new Set<string>();

    for (const inscription of inscriptions) {
      const inscriptionId = inscription.getId();

      if (inscription.getIsGuest()) {
        guestInscriptionIdSet.add(inscriptionId);
      }

      if (!inscription.getIsGuest()) {
        const accountId = inscription.getAccountId();
        if (accountId) {
          normalInscriptionIdSet.add(inscriptionId);
        }
      }

      if (!inscription.getAccountId()) {
        guestInscriptionIdSet.add(inscriptionId);
      }
    }

    const normalInscriptionIds = Array.from(normalInscriptionIdSet.values());
    const guestInscriptionIds = Array.from(guestInscriptionIdSet.values());

    const [normalParticipants, guestParticipants, allocations] =
      await Promise.all([
        this.accountParticipantInEventGateway.findManyByInscriptionIds(
          normalInscriptionIds,
        ),
        this.participantGateway.findManyByInscriptionIds(guestInscriptionIds),
        this.paymentAllocationGateway.findManyByInscriptionIdsWithMethodAndInscription(
          inscriptionIds,
        ),
      ]);

    const normalParticipantsByInscription = new Map<string, number>();
    for (const participant of normalParticipants) {
      const id = participant.getInscriptionId();
      const count = normalParticipantsByInscription.get(id) ?? 0;
      normalParticipantsByInscription.set(id, count + 1);
    }

    const guestParticipantsByInscription = new Map<string, number>();
    for (const participant of guestParticipants) {
      const id = participant.getInscriptionId();
      const count = guestParticipantsByInscription.get(id) ?? 0;
      guestParticipantsByInscription.set(id, count + 1);
    }

    const typeInscriptionOutput = typeInscriptions.map((type) => ({
      id: type.getId(),
      description: type.getDescription(),
      amount: type.getValue(),
    }));

    const paymentMethodCounts = new Map<PaymentMethod, number>();
    avulsParticipantsPerMethod.forEach((stat) => {
      paymentMethodCounts.set(stat.paymentMethod, stat.countParticipants);
    });

    const paymentTotalsByMethod: Record<PaymentMethod, number> = {
      [PaymentMethod.DINHEIRO]: avulsPaymentTotals.totalDinheiro ?? 0,
      [PaymentMethod.PIX]: avulsPaymentTotals.totalPix ?? 0,
      [PaymentMethod.CARTAO]: avulsPaymentTotals.totalCartao ?? 0,
    };

    const byPaymentMethod: AvulsoPaymentMethodReport[] = (
      Object.values(PaymentMethod) as PaymentMethod[]
    ).map((method) => ({
      paymentMethod: method,
      countParticipants: paymentMethodCounts.get(method) ?? 0,
      totalValue: paymentTotalsByMethod[method] ?? 0,
    }));

    const inscriptionAvuls: InscriptionAvuls = {
      countParticipants: avulsParticipantsCount,
      totalValue: avulsPaymentTotals.totalGeral,
      byPaymentMethod,
    };

    const normalInscriptionSummary = this.buildInscriptionSummary(
      normalInscriptionIds,
      normalParticipantsByInscription,
      allocations,
    );

    const guestInscriptionSummary = this.buildInscriptionSummary(
      guestInscriptionIds,
      guestParticipantsByInscription,
      allocations,
    );

    const eventTicketNameMap = new Map(
      eventTickets.map((ticket) => [ticket.getId(), ticket.getName()]),
    );

    const ticketGroups = new Map<string, TicketSaleByTicket>();
    let totalTicketsSold = 0;

    for (const item of ticketSaleItems) {
      totalTicketsSold += item.getQuantity();
      const ticketId = item.getTicketId();
      const existing = ticketGroups.get(ticketId);
      const ticketName =
        eventTicketNameMap.get(ticketId) ??
        existing?.ticketName ??
        'Ticket não identificado';

      if (existing) {
        existing.quantity += item.getQuantity();
        existing.totalValue += item.getTotalValue();
      } else {
        ticketGroups.set(ticketId, {
          ticketId,
          ticketName,
          quantity: item.getQuantity(),
          totalValue: item.getTotalValue(),
        });
      }
    }

    const ticketByTicket = Array.from(ticketGroups.values());

    const ticketPaymentMap = new Map<
      PaymentMethod,
      TicketSaleByPaymentMethod
    >();
    ticketSalePayments.forEach((stat) => {
      ticketPaymentMap.set(stat.paymentMethod, {
        paymentMethod: stat.paymentMethod,
        count: stat.count,
        totalValue: stat.totalValue,
      });
    });

    const ticketByPaymentMethod: TicketSaleByPaymentMethod[] = (
      Object.values(PaymentMethod) as PaymentMethod[]
    ).map((method) => {
      const stats = ticketPaymentMap.get(method);
      return {
        paymentMethod: method,
        count: stats?.count ?? 0,
        totalValue: stats?.totalValue ?? 0,
      };
    });

    const ticketSale: TicketSale = {
      totalSales: ticketSaleSummary.totalSalesValue,
      totalTicketsSold,
      byTicket: ticketByTicket,
      byPaymentMethod: ticketByPaymentMethod,
    };

    let totalExpenses = 0;
    let totalDinheiro = 0;
    let totalPix = 0;
    let totalCartao = 0;

    const expenseDetails: ExpenseDetail[] = eventExpenses.map((expense) => {
      const value = expense.getValue();
      totalExpenses += value;

      switch (expense.getPaymentMethod()) {
        case PaymentMethod.DINHEIRO:
          totalDinheiro += value;
          break;
        case PaymentMethod.PIX:
          totalPix += value;
          break;
        case PaymentMethod.CARTAO:
          totalCartao += value;
          break;
        default:
          break;
      }

      return {
        id: expense.getId(),
        description: expense.getDescription(),
        value,
        paymentMethod: expense.getPaymentMethod(),
        responsible: expense.getResponsible(),
        createdAt: expense.getCreatedAt(),
        updatedAt: expense.getUpdatedAt(),
      };
    });

    const expensesReport: ExpensesReport = {
      total: totalExpenses,
      totalDinheiro,
      totalPix,
      totalCartao,
      gastos: expenseDetails,
    };

    const output: ReportGeneralOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image,
      logo: event.getLogoUrl(),
      totalInscriptions: total,
      countTypeInscription: typeInscriptions.length,
      countParticipants: event.getQuantityParticipants(),
      totalValue: event.getAmountCollected(),
      totalDebt: totalDebt,
      typeInscriptions: typeInscriptionOutput,
      inscriptions: [normalInscriptionSummary],
      guestInscriptions: [guestInscriptionSummary],
      inscriptionAvuls,
      ticketSale,
      expenses: expensesReport,
      gastos: expensesReport,
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }

  private buildInscriptionSummary(
    inscriptionIds: string[],
    participantsByInscription: Map<string, number>,
    allocations: {
      inscriptionId: string;
      value: number;
      paymentMethod: PaymentMethod;
    }[],
  ): Inscription {
    const inscriptionIdSet = new Set(inscriptionIds);
    const methodTotals = new Map<PaymentMethod, number>();
    const methodInscriptionIds = new Map<PaymentMethod, Set<string>>();
    const methods = Object.values(PaymentMethod) as PaymentMethod[];

    for (const method of methods) {
      methodTotals.set(method, 0);
      methodInscriptionIds.set(method, new Set());
    }

    for (const allocation of allocations) {
      if (!inscriptionIdSet.has(allocation.inscriptionId)) {
        continue;
      }

      const currentTotal = methodTotals.get(allocation.paymentMethod) ?? 0;
      methodTotals.set(
        allocation.paymentMethod,
        currentTotal + allocation.value,
      );

      const methodSet =
        methodInscriptionIds.get(allocation.paymentMethod) ?? new Set();
      methodSet.add(allocation.inscriptionId);
      methodInscriptionIds.set(allocation.paymentMethod, methodSet);
    }

    let totalParticipants = 0;
    for (const inscriptionId of inscriptionIdSet) {
      totalParticipants += participantsByInscription.get(inscriptionId) ?? 0;
    }

    let totalValue = 0;
    for (const method of methods) {
      totalValue += methodTotals.get(method) ?? 0;
    }

    const byPaymentMethod: InscriptionPaymentMethodReport[] = methods.map(
      (method) => {
        const ids = methodInscriptionIds.get(method) ?? new Set();
        let countParticipants = 0;
        for (const inscriptionId of ids) {
          countParticipants +=
            participantsByInscription.get(inscriptionId) ?? 0;
        }

        return {
          paymentMethod: method,
          countParticipants,
          totalValue: methodTotals.get(method) ?? 0,
        };
      },
    );

    return {
      countParticipants: totalParticipants,
      totalValue,
      byPaymentMethod,
    };
  }
}
