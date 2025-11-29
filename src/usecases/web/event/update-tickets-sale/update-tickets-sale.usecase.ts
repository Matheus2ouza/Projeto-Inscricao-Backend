import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type UpdateTicketsSaleInput = {
  eventId: string;
  saleTicketsStatus: boolean;
};

export type UpdateTicketsSaleOutput = {
  id: string;
  saleTicketsStatus?: boolean;
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

    event.updateTicketStatus(input.saleTicketsStatus);
    await this.eventGateway.update(event);

    const output: UpdateTicketsSaleOutput = {
      id: event.getId(),
      saleTicketsStatus: event.getTicketEnabled(),
    };

    return output;
  }
}
