import { Injectable } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindTicketsForSaleInput = {
  eventId: string;
};

export type FindTicketsForSaleOutput = {
  id: string;
  name: string;
  imageUrl?: string;
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
export class FindTicketsForSaleUsecase
  implements Usecase<FindTicketsForSaleInput, FindTicketsForSaleOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSale: TicketSaleGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindTicketsForSaleInput,
  ): Promise<FindTicketsForSaleOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId} in ${FindTicketsForSaleUsecase.name}`,
        `Evento não encontrado`,
        FindTicketsForSaleUsecase.name,
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

    const [tickets] = await Promise.all([
      this.eventTicketsGateway.findAll(event.getId()),
    ]);

    const output: FindTicketsForSaleOutput = {
      id: event.getId(),
      name: event.getName(),
      imageUrl: publicImageUrl,
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
