import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ReportFinancialInput = {
  eventId: string;
  details: boolean;
};

export type ReportFinancialOutput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  logo?: string;

  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  totalSpent: number;
  inscription: Inscription;
  inscriptionAvuls: InscriptionAvuls;
  ticketsSale: TicketSale;
  spent: Spent;
};

export type Inscription = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionDetail[];
};

export type InscriptionDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type InscriptionAvuls = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionAvulsDetail[];
};

export type InscriptionAvulsDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type TicketSale = {
  totalGeral: number;
  countTickets: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  details?: TicketSaleDetail[];
};

export type TicketSaleDetail = {
  id: string;
  name: string;
  quantity: number;
  pricePerTicket: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
};

export type Spent = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  spentDetails?: SpentDetail[];
};

export type SpentDetail = {
  id: string;
  createdAt: Date;
  totalSpent: number;
};

@Injectable()
export class ReportFinancialUsecase
  implements Usecase<ReportFinancialInput, ReportFinancialOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
    private readonly onSiteParticipantPaymentGateway: OnSiteParticipantPaymentGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
  ) {}

  async execute(input: ReportFinancialInput): Promise<ReportFinancialOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ReportFinancialUsecase.name,
      );
    }
    // Tickets: totais por método e detalhes opcionais
    const [ticketPaymentSummary, ticketItems, eventTickets] = await Promise.all(
      [
        this.ticketSalePaymentGateway.sumByEventId(event.getId()),
        this.ticketSaleItemGateway.findByEventId(event.getId()),
        this.eventTicketsGateway.findAll(event.getId()),
      ],
    );

    const methodTotals = new Map<string, number>();
    for (const s of ticketPaymentSummary) {
      methodTotals.set(String(s.paymentMethod), Number(s.totalValue ?? 0));
    }

    const ticketsCash = methodTotals.get('DINHEIRO') ?? 0;
    const ticketsCard = methodTotals.get('CARTAO') ?? 0;
    const ticketsPix = methodTotals.get('PIX') ?? 0;
    const ticketsTotal = ticketsCash + ticketsCard + ticketsPix;

    const ticketNameMap = new Map(
      eventTickets.map((t) => [t.getId(), t.getName()]),
    );
    const ticketPriceMap = new Map(
      eventTickets.map((t) => [t.getId(), Number(t.getPrice())]),
    );

    const ticketAggregate = new Map<
      string,
      { quantity: number; totalValue: number }
    >();
    let countTickets = 0;
    let totalTicketsValue = 0;
    for (const item of ticketItems) {
      countTickets += item.getQuantity();
      totalTicketsValue += Number(item.getTotalValue());
      const cur = ticketAggregate.get(item.getTicketId()) ?? {
        quantity: 0,
        totalValue: 0,
      };
      cur.quantity += item.getQuantity();
      cur.totalValue += Number(item.getTotalValue());
      ticketAggregate.set(item.getTicketId(), cur);
    }

    let ticketDetails: TicketSaleDetail[] | undefined = undefined;
    if (input.details) {
      ticketDetails = Array.from(ticketAggregate.entries()).map(
        ([ticketId, agg]) => {
          const proportion =
            totalTicketsValue > 0 ? agg.totalValue / totalTicketsValue : 0;
          const paidCash = ticketsCash * proportion;
          const paidCard = ticketsCard * proportion;
          const paidPix = ticketsPix * proportion;
          return {
            id: ticketId,
            name: ticketNameMap.get(ticketId) ?? 'Ticket',
            quantity: agg.quantity,
            pricePerTicket: ticketPriceMap.get(ticketId) ?? 0,
            totalCash: paidCash,
            totalCard: paidCard,
            totalPix: paidPix,
          };
        },
      );
    }

    const inscriptions = await this.inscriptionGateway.findByEventId({
      eventId: event.getId(),
    });
    const inscriptionIds = inscriptions.map((i) => i.getId());
    const allocations =
      await this.paymentAllocationGateway.findManyByInscriptionIds(
        inscriptionIds,
      );
    let inscriptionCash = 0;
    let inscriptionCard = 0;
    let inscriptionPix = 0;
    for (const a of allocations) {
      if (a.paymentMethod === 'DINHEIRO') inscriptionCash += a.value;
      else if (a.paymentMethod === 'CARTAO') inscriptionCard += a.value;
      else if (a.paymentMethod === 'PIX') inscriptionPix += a.value;
    }
    const inscriptionTotal = inscriptionCash + inscriptionCard + inscriptionPix;
    const inscriptionParticipants =
      await this.accountParticipantInEventGateway.countParticipantsByEventId(
        event.getId(),
      );
    let inscriptionDetails: InscriptionDetail[] | undefined = undefined;
    if (input.details) {
      const detailedAllocations =
        await this.paymentAllocationGateway.findManyByInscriptionIdsWithMethodAndInscription(
          inscriptionIds,
        );
      const inscMap = new Map<
        string,
        { cash: number; card: number; pix: number }
      >();
      for (const a of detailedAllocations) {
        const cur = inscMap.get(a.inscriptionId) ?? {
          cash: 0,
          card: 0,
          pix: 0,
        };
        if (a.paymentMethod === 'DINHEIRO') cur.cash += a.value;
        else if (a.paymentMethod === 'CARTAO') cur.card += a.value;
        else if (a.paymentMethod === 'PIX') cur.pix += a.value;
        inscMap.set(a.inscriptionId, cur);
      }
      const paidInscriptions = inscriptions.filter(
        (i) => i.getStatus() === InscriptionStatus.PAID,
      );
      inscriptionDetails = paidInscriptions.map((i) => {
        const sums = inscMap.get(i.getId()) ?? { cash: 0, card: 0, pix: 0 };
        const totalPaid = sums.cash + sums.card + sums.pix;
        return {
          id: i.getId(),
          createdAt: i.getCreatedAt(),
          totalPaid,
          paidCash: sums.cash,
          paidCard: sums.card,
          paidPix: sums.pix,
        };
      });
    }
    const registrationsTotals =
      await this.onSiteRegistrationGateway.sumPaymentsByMethod(event.getId());
    const avulsCash = registrationsTotals.totalDinheiro;
    const avulsCard = registrationsTotals.totalCartao;
    const avulsPix = registrationsTotals.totalPix;
    const avulsTotal = registrationsTotals.totalGeral;
    const avulsParticipants =
      await this.onSiteRegistrationGateway.countParticipantsByEventId(
        event.getId(),
      );
    let avulsDetails: InscriptionAvulsDetail[] | undefined = undefined;
    if (input.details) {
      const registrations =
        await this.onSiteRegistrationGateway.findManyByEventId(event.getId());
      const details: InscriptionAvulsDetail[] = [];
      for (const r of registrations) {
        const participants =
          await this.onSiteParticipantGateway.findManyByOnSiteRegistrationId(
            r.getId(),
          );
        let cash = 0;
        let card = 0;
        let pix = 0;
        for (const p of participants) {
          const payments =
            await this.onSiteParticipantPaymentGateway.findManyByOnSiteParticipantsPayment(
              p.getId(),
            );
          for (const pay of payments) {
            const v = Number(pay.getValue());
            const m = pay.getPaymentMethod();
            if (m === 'DINHEIRO') cash += v;
            else if (m === 'CARTAO') card += v;
            else if (m === 'PIX') pix += v;
          }
        }
        const totalPaid = cash + card + pix;
        details.push({
          id: r.getId(),
          createdAt: r.getCreatedAt(),
          totalPaid,
          paidCash: cash,
          paidCard: card,
          paidPix: pix,
        });
      }
      avulsDetails = details;
    }
    const expenses = await this.eventExpensesGateway.findManyByEventId(
      event.getId(),
    );
    let spentCash = 0;
    let spentCard = 0;
    let spentPix = 0;
    for (const e of expenses) {
      const v = e.getValue();
      const m = e.getPaymentMethod();
      if (m === 'DINHEIRO') spentCash += v;
      else if (m === 'CARTAO') spentCard += v;
      else if (m === 'PIX') spentPix += v;
    }
    const spentTotal = spentCash + spentCard + spentPix;
    let spentDetails: SpentDetail[] | undefined = undefined;
    if (input.details) {
      spentDetails = expenses.map((e) => ({
        id: e.getId(),
        createdAt: e.getCreatedAt(),
        totalSpent: e.getValue(),
      }));
    }
    const totalCash = inscriptionCash + avulsCash + ticketsCash;
    const totalCard = inscriptionCard + avulsCard + ticketsCard;
    const totalPix = inscriptionPix + avulsPix + ticketsPix;
    const totalGeral = totalCash + totalCard + totalPix - spentTotal;
    const output: ReportFinancialOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image: event.getImageUrl() ?? '',
      logo: event.getLogoUrl(),
      totalGeral,
      totalCash,
      totalCard,
      totalPix,
      totalSpent: spentTotal,
      inscription: {
        totalGeral: inscriptionTotal,
        totalCash: inscriptionCash,
        totalCard: inscriptionCard,
        totalPix: inscriptionPix,
        countParticipants: inscriptionParticipants,
        details: inscriptionDetails,
      },
      inscriptionAvuls: {
        totalGeral: avulsTotal,
        totalCash: avulsCash,
        totalCard: avulsCard,
        totalPix: avulsPix,
        countParticipants: avulsParticipants,
        details: avulsDetails,
      },
      ticketsSale: {
        totalGeral: ticketsTotal,
        countTickets,
        totalCash: ticketsCash,
        totalCard: ticketsCard,
        totalPix: ticketsPix,
        details: ticketDetails,
      },
      spent: {
        totalGeral: spentTotal,
        totalCash: spentCash,
        totalCard: spentCard,
        totalPix: spentPix,
        spentDetails,
      },
    };
    return output;
  }
}
