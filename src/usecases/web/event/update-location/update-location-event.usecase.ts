import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type UpdateLocationEventInput = {
  eventId: string;
  location: string;
};

export type UpdateLocationEventOutput = {
  id: string;
};

@Injectable()
export class UpdateLocationEventUsecase
  implements Usecase<UpdateLocationEventInput, UpdateLocationEventOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  async execute(
    input: UpdateLocationEventInput,
  ): Promise<UpdateLocationEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        UpdateLocationEventUsecase.name,
      );
    }

    event.updateLocation(input.location);

    await this.eventGateway.update(event);

    const output: UpdateLocationEventOutput = {
      id: event.getId(),
    };

    return output;
  }
}
