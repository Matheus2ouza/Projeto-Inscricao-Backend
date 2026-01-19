import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
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

  typeInscription: TypeInscription;
  inscriptionAvuls: InscriptionAvuls;
  ticketSale: TicketSale;
  expenses: ExpensesReport;
  gastos: ExpensesReport;
};

type TypeInscription = {
  id: string;
  description: string;
  amount: number;
  countParticipants: number;
  totalValue: number;
}[];

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
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
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

    // Buscar todos os participantes de todas as inscrições pagas
    const participants =
      await this.participantGateway.findManyByInscriptionIds(inscriptionIds);

    const participantCountMap = new Map<string, number>();

    for (const participant of participants) {
      const typeId = participant.getTypeInscriptionId();
      const previousCount = participantCountMap.get(typeId) ?? 0;
      participantCountMap.set(typeId, previousCount + 1);
    }

    // Montar o array final (valor total = quantidade * valor do tipo)
    const typeInscriptionOutput = typeInscriptions.map((type) => {
      const count = participantCountMap.get(type.getId()) ?? 0;
      const amount = type.getValue();

      return {
        id: type.getId(),
        description: type.getDescription(),
        amount,
        countParticipants: count,
        totalValue: count * amount,
      };
    });

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
      typeInscription: typeInscriptionOutput,
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
}
