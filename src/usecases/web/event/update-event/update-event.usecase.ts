import { Injectable } from '@nestjs/common';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
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
  responsibles: string[];
};

export type UpdateEventOutput = {
  id: string;
};

@Injectable()
export class UpdateEventUseCase
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
        `Event not found with id ${input.id} in ${UpdateEventUseCase.name}`,
        `Evento não encontrado`,
        UpdateEventUseCase.name,
      );
    }

    // Atualiza os campos do evento
    event.update({
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
    });

    // Salva o evento atualizado
    await this.eventGateway.update(event);

    // Adiciona novos responsáveis (se houver)
    if (input.responsibles && input.responsibles.length > 0) {
      const currentResponsibles =
        await this.eventResponsibleGateway.findByEventId(input.id);

      // Extrai os IDs dos responsáveis atuais
      const currentResponsibleIds = currentResponsibles.map((r) =>
        r.getAccountId(),
      );

      // Adiciona apenas novos responsáveis que ainda não existem
      const responsiblesToAdd = input.responsibles.filter(
        (id) => !currentResponsibleIds.includes(id),
      );
      for (const accountId of responsiblesToAdd) {
        const responsibleEntity = EventResponsible.create({
          eventId: input.id,
          accountId: accountId,
        });
        await this.eventResponsibleGateway.create(responsibleEntity);
      }
    }

    return {
      id: event.getId(),
    };
  }
}
