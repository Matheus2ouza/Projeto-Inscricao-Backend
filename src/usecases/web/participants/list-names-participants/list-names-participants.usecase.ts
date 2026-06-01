import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListNamesParticipantsInput = {
  eventId: string;
};

export type ListNamesParticipantsOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class ListNamesParticipantsUsecase
  implements Usecase<ListNamesParticipantsInput, ListNamesParticipantsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  async execute(
    input: ListNamesParticipantsInput,
  ): Promise<ListNamesParticipantsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `An attempt was made to find the participants, but it was an invalid event. ID: ${input.eventId}`,
        `Nenhum evento encontrado.`,
        ListNamesParticipantsUsecase.name,
      );
    }

    const participants = await this.participantGateway.findByEventId(
      event.getId(),
    );

    const output: ListNamesParticipantsOutput = participants.map(
      (participant) => ({
        id: participant.getId(),
        name: participant.getName(),
      }),
    );

    return output;
  }
}
