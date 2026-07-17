import { Injectable } from '@nestjs/common';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type UpdateEventInput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
};

export type UpdateEventOutput = {
  id: string;
};

@Injectable()
export class UpdateEventUsecase
  implements Usecase<UpdateEventInput, UpdateEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
  ) {}

  public async execute(input: UpdateEventInput): Promise<UpdateEventOutput> {
    const event = await this.eventGateway.findById(input.id);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.id} in ${UpdateEventUsecase.name}`,
        `Evento não encontrado`,
        UpdateEventUsecase.name,
      );
    }

    // Atualiza os campos do evento
    event.update({
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
    });

    // Salva o evento atualizado
    await this.eventGateway.update(event);

    const output: UpdateEventOutput = {
      id: event.getId(),
    };
    return output;
  }
}
