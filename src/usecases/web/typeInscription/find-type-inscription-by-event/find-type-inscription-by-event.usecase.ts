import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindTypeInscriptionByEventInput = {
  eventId: string;
};

export type FindTypeInscriptionByEventOutput = {
  id: string;
  description: string;
  rule: Date | null;
  value: number;
  specialType: boolean;
  active: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
  createdAt: Date;
}[];

@Injectable()
export class FindTypeInscriptionByEventUsecase
  implements
    Usecase<FindTypeInscriptionByEventInput, FindTypeInscriptionByEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: FindTypeInscriptionByEventInput,
  ): Promise<FindTypeInscriptionByEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to list type inscriptions for event ${input.eventId} that does not exist`,
        `Não foi possível encontrar o evento informado.`,
        FindTypeInscriptionByEventUsecase.name,
      );
    }

    const typeInscriptions = await this.typeInscriptionGateway.findByEventId(
      event.getId(),
    );

    const output: FindTypeInscriptionByEventOutput = typeInscriptions.map(
      (typeInscription) => ({
        id: typeInscription.getId(),
        description: typeInscription.getDescription(),
        rule: typeInscription.getRule(),
        value: typeInscription.getValue(),
        specialType: typeInscription.getSpecialType(),
        active: typeInscription.getActive(),
        participantLimit: typeInscription.getParticipantLimit(),
        limitIsStrict: typeInscription.getLimitIsStrict(),
        createdAt: typeInscription.getCreatedAt(),
      }),
    );
    return output;
  }
}
