import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindTypeInscriptionByEventIdInput = {
  eventId: string;
};

export type FindTypeInscriptionByEventIdOutput = {
  id: string;
  description: string;
  value: number;
  specialType: boolean;
}[];

@Injectable()
export class FindTypeInscriptionByEventIdUsecase
  implements
    Usecase<
      FindTypeInscriptionByEventIdInput,
      FindTypeInscriptionByEventIdOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: FindTypeInscriptionByEventIdInput,
  ): Promise<FindTypeInscriptionByEventIdOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to list type inscriptions for event ${input.eventId} that does not exist`,
        `Não foi possível encontrar o evento informado.`,
        FindTypeInscriptionByEventIdUsecase.name,
      );
    }

    const typeInscriptions = await this.typeInscriptionGateway.findByEventId(
      event.getId(),
    );

    const output: FindTypeInscriptionByEventIdOutput = typeInscriptions.map(
      (typeInscription) => ({
        id: typeInscription.getId(),
        description: typeInscription.getDescription(),
        value: typeInscription.getValue(),
        specialType: typeInscription.getSpecialType(),
      }),
    );
    return output;
  }
}
