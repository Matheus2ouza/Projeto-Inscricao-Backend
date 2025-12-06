import { Injectable } from '@nestjs/common';
import { PaymentMethod, TicketSaleStatus } from 'generated/prisma';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TicketSaleNotFoundUsecaseException } from '../../exceptions/tickets/ticket-sale-not-found.usecase.exception';

export type FindAllListPreSaleInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllListPreSaleOutput = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  imageUrl: string;
  countTicketSales: number;
  countTicketSalesPending: number;
  countTicketSalesPaid: number;
  ticketSales: TicketSales[];
};

type TicketSales = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TicketSaleStatus;
  totalValue: number;
  approvedBy?: string;
  payments: TicketSalePayment;
  TicketSaleItem: TicketSaleItem[];
};

type TicketSalePayment = {
  id: string;
  paymentMethod: PaymentMethod;
  value: number;
  imageUrl: string;
  createdAt: Date;
};

type TicketSaleItem = {
  id: string;
  ticketName: string;
  quantity: number;
  pricePerTicket: number;
  totalValue: number;
};

@Injectable()
export class FindAllListPreSaleUsecase
  implements Usecase<FindAllListPreSaleInput, FindAllListPreSaleOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAllListPreSaleInput,
  ): Promise<FindAllListPreSaleOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        FindAllListPreSaleUsecase.name,
      );
    }

    const [eventTickets, ticketSales, total, totalPending, totalPaid] =
      await Promise.all([
        this.eventTicketsGateway.findAll(event.getId()),
        this.ticketSaleGateway.findByEventIdWithPagination(
          safePage,
          safePageSize,
          {
            eventId: event.getId(),
            status: ['PAID', 'UNDER_REVIEW', 'PENDING'],
          },
        ),
        this.ticketSaleGateway.countSalesByEventId(event.getId()),
        this.ticketSaleGateway.countByEventIdAndStatus(event.getId(), [
          'UNDER_REVIEW',
        ]),
        this.ticketSaleGateway.countByEventIdAndStatus(event.getId(), ['PAID']),
      ]);

    if (!ticketSales.length) {
      throw new TicketSaleNotFoundUsecaseException(
        `Ticket sales with event id ${input.eventId} not found.`,
        `Nenhuma pré-venda encontrada para este evento.`,
        FindAllListPreSaleUsecase.name,
      );
    }

    const pageCount = Math.ceil(total / safePageSize);
    const publicImageUrl = await this.getPublicUrlOrEmpty(event.getImageUrl());

    const ticketNameMap = new Map(
      eventTickets.map((ticket) => [ticket.getId(), ticket.getName()]),
    );

    const ticketSalesWithDetails = await Promise.all(
      ticketSales.map(async (sale) => {
        const [payments, ticketSaleItems] = await Promise.all([
          this.ticketSalePaymentGateway.findByTicketSaleId(sale.getId()),
          this.ticketSaleItemGateway.findByTicketSaleId(sale.getId()),
        ]);

        const [payment] = payments;

        if (!payment) {
          throw new TicketSaleNotFoundUsecaseException(
            `Payments for ticket sale ${sale.getId()} not found.`,
            `Pagamento da venda ${sale.getId()} não encontrado.`,
            FindAllListPreSaleUsecase.name,
          );
        }

        const paymentImageUrl = await this.getPublicUrlOrEmpty(
          payment.getImageUrl(),
        );

        const mappedItems = ticketSaleItems.map((item) => ({
          id: item.getId(),
          ticketName: ticketNameMap.get(item.getTicketId()) ?? '',
          quantity: item.getQuantity(),
          pricePerTicket: item.getPricePerTicket(),
          totalValue: item.getTotalValue(),
        }));

        return {
          id: sale.getId(),
          name: sale.getName(),
          email: sale.getEmail() ?? '',
          phone: sale.getPhone() ?? '',
          status: sale.getStatus(),
          totalValue: sale.getTotalValue(),
          approvedBy: sale.getApprovedBy(),
          payments: {
            id: payment.getId(),
            paymentMethod: payment.getPaymentMethod(),
            value: payment.getValue(),
            imageUrl: paymentImageUrl,
            createdAt: payment.getCreatedAt(),
          },
          TicketSaleItem: mappedItems,
        };
      }),
    );

    return {
      event: {
        id: event.getId(),
        name: event.getName(),
        imageUrl: publicImageUrl,
        countTicketSales: total,
        countTicketSalesPending: totalPending,
        countTicketSalesPaid: totalPaid,
        ticketSales: ticketSalesWithDetails,
      },
      total,
      page: safePage,
      pageCount,
    };
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
