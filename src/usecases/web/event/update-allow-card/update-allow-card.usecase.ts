import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type UpdateAllowCardInput = {
  eventId: string;
  allowCard: boolean;
};

export type UpdateAllowCardOutput = {
  allowCard?: boolean;
};

@Injectable()
export class UpdateAllowCardUseCase
  implements Usecase<UpdateAllowCardInput, UpdateAllowCardOutput>
{
  constructor(private readonly eventGateway: EventGateway) {}

  async execute(input: UpdateAllowCardInput): Promise<UpdateAllowCardOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        UpdateAllowCardUseCase.name,
      );
    }

    event.setAllowCard(input.allowCard);
    const eventUpdated = await this.eventGateway.update(event);

    const output: UpdateAllowCardOutput = {
      allowCard: eventUpdated.getAllowCard(),
    };

    return output;
  }
}
