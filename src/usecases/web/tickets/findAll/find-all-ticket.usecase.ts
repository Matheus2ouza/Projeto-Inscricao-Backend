import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindAllTicketInput = {
  eventId: string;
};

export type FindAllTicketOutput = {
  id: string;
  name: string;
  imageUrl?: string;
  quantityTicketSale: number;
  totalSalesValue: number;
  ticketEnabled?: boolean;
  tickets: Tickets;
};

type Tickets = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  expirationDate: Date;
  available: number;
  isActive: boolean;
}[];

@Injectable()
export class FindAllTicketsUsecase
  implements Usecase<FindAllTicketInput, FindAllTicketOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(input: FindAllTicketInput): Promise<FindAllTicketOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId} in ${FindAllTicketsUsecase.name}`,
        `Evento não encontrado`,
        FindAllTicketsUsecase.name,
      );
    }

    let publicImageUrl: string | undefined = undefined;
    const imagePath = event.getImageUrl();
    if (imagePath) {
      try {
        publicImageUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
      } catch (e) {
        publicImageUrl = undefined;
      }
    }

    const [tickets, salesSummary] = await Promise.all([
      this.eventTicketsGateway.findAll(event.getId()),
      this.ticketSaleGateway.getEventSalesSummary(event.getId()),
    ]);

    const output: FindAllTicketOutput = {
      id: event.getId(),
      name: event.getName(),
      imageUrl: publicImageUrl,
      quantityTicketSale: salesSummary.quantityTicketSale,
      totalSalesValue: salesSummary.totalSalesValue,
      ticketEnabled: event.getTicketEnabled(),
      tickets: tickets.map((t) => ({
        id: t.getId(),
        name: t.getName(),
        description: t.getDescription(),
        quantity: t.getQuantity(),
        price: t.getPrice(),
        expirationDate: t.getExpirationDate(),
        available: t.getAvailable(),
        isActive: t.getIsActive(),
      })),
    };

    return output;
  }
}
