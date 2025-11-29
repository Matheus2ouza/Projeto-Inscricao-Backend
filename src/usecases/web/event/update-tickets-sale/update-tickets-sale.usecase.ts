import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type UpdateTicketsSaleInput = {
  eventId: string;
  saleTicketsEnabled: boolean;
};

export type UpdateTicketsSaleOutput = {
  id: string;
  ticketEnabled?: boolean;
};

@Injectable()
export class UpdateTicketsSaleUsecase
  implements Usecase<UpdateTicketsSaleInput, UpdateTicketsSaleOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: UpdateTicketsSaleInput,
  ): Promise<UpdateTicketsSaleOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        UpdateTicketsSaleUsecase.name,
      );
    }

    input.saleTicketsEnabled ? event.enableTicket() : event.disableTicket();
    await this.eventGateway.enableTicket(event.getId());

    const output: UpdateTicketsSaleOutput = {
      id: event.getId(),
      ticketEnabled: event.getTicketEnabled(),
    };

    return output;
  }
}
