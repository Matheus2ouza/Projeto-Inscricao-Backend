import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type UpdateLocationEventInput = {
  eventId: string;
  location: string;
  longitude: number;
  latitude: number;
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

    event.updateLocation(input.location, input.longitude, input.latitude);

    await this.eventGateway.update(event);

    const output: UpdateLocationEventOutput = {
      id: event.getId(),
    };

    return output;
  }
}
