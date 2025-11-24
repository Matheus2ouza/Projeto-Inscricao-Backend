import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventHasParticipantsUsecaseException } from '../../../exceptions/events/event-has-participants.usecase.exception';
import { EventNotFoundUsecaseException } from '../../../exceptions/events/event-not-found.usecase.exception';

export type DeleteEventInput = {
  eventId: string;
};

@Injectable()
export class DeleteEventUsecase implements Usecase<DeleteEventInput, void> {
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(input: DeleteEventInput): Promise<void> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found in ${DeleteEventUsecase.name}`,
        `Nenhum evento encontrado para o ID informado.`,
        DeleteEventUsecase.name,
      );
    }

    if (event.getQuantityParticipants() > 0) {
      throw new EventHasParticipantsUsecaseException(
        `Cannot delete event ${event.getId()} because it already has participants.`,
        `Não é possível excluir este evento pois ele já possui inscrições.`,
        DeleteEventUsecase.name,
      );
    }

    await this.eventGateway.delete(event.getId());
  }
}
