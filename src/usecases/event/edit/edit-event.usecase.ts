import { Injectable } from '@nestjs/common';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type EditEventInput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  responsibles: string[];
};

export type EditEventOutput = {
  id: string;
};

@Injectable()
export class EditEventUseCase
  implements Usecase<EditEventInput, EditEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
  ) {}

  public async execute(input: EditEventInput): Promise<EditEventOutput> {
    const event = await this.eventGateway.findById(input.id);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.id} in ${EditEventUseCase.name}`,
        `Evento não encontrado`,
        EditEventUseCase.name,
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
