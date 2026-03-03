import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindAllNamesInscriptionInput = {
  eventId: string;
};

export type FindAllNamesInscriptionOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class FindAllNamesInscriptionUsecase
  implements
    Usecase<FindAllNamesInscriptionInput, FindAllNamesInscriptionOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(
    input: FindAllNamesInscriptionInput,
  ): Promise<FindAllNamesInscriptionOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        FindAllNamesInscriptionUsecase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findByEventId(
      event.getId(),
    );

    const output: FindAllNamesInscriptionOutput = inscriptions.map((i) => ({
      id: i.getId(),
      name: i.getGuestName() || i.getResponsible(),
    }));

    return output;
  }
}
