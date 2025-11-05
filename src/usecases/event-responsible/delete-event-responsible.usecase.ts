import { Injectable } from '@nestjs/common';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventResponsibleNotFoundUsecaseException } from '../exceptions/events-responsible/event-responsible-not-found.usecase.exception';
import { Usecase } from '../usecase';

export type DeleteEventResponsibleInput = {
  eventId: string;
  accountId: string;
};

export type DeleteEventResponsibleOutput = void;

@Injectable()
export class DeleteEventResponsibleUseCase
  implements Usecase<DeleteEventResponsibleInput, DeleteEventResponsibleOutput>
{
  public constructor(
    private readonly eventResponsibleGateway: EventResponsibleGateway,
  ) {}

  public async execute(
    input: DeleteEventResponsibleInput,
  ): Promise<DeleteEventResponsibleOutput> {
    const eventResponsible =
      await this.eventResponsibleGateway.findByEventAndAccount(
        input.eventId,
        input.accountId,
      );
    if (!eventResponsible) {
      throw new EventResponsibleNotFoundUsecaseException(
        `Event responsible not found with eventId: ${input.eventId} and accountId: ${input.accountId}`,
        `Responsável de evento não encontrado`,
        DeleteEventResponsibleUseCase.name,
      );
    }

    await this.eventResponsibleGateway.deleteByEventAndAccount(
      input.eventId,
      input.accountId,
    );

    return;
  }
}
