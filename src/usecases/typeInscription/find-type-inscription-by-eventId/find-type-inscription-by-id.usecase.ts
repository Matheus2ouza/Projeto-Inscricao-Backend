import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';

export type FindTypeInscriptionByEventIdInput = {
  eventId: string;
};

export type FindTypeInscriptionByEventIdOutput = {
  id: string;
  description: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
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
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute({
    eventId,
  }: FindTypeInscriptionByEventIdInput): Promise<FindTypeInscriptionByEventIdOutput> {
    const typeInscriptions =
      await this.typeInscriptionGateway.findByEventId(eventId);

    const output: FindTypeInscriptionByEventIdOutput = typeInscriptions.map(
      (typeInscription) => ({
        id: typeInscription.getId(),
        description: typeInscription.getDescription(),
        value: typeInscription.getValue(),
        createdAt: typeInscription.getCreatedAt(),
        updatedAt: typeInscription.getUpdatedAt(),
      }),
    );
    return output;
  }
}
