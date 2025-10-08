import { FindTypeInscriptionByEventIdOutput } from 'src/usecases/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-id.usecase';
import { FindTypeInscriptionByEventIdResponse } from './find-type-inscription-by-eventId.dto';

export class FindTypeInscriptionByEventIdPresenter {
  public static toHttp(
    input: FindTypeInscriptionByEventIdOutput,
  ): FindTypeInscriptionByEventIdResponse {
    return input.map((typeInscription) => ({
      id: typeInscription.id,
      description: typeInscription.description,
      value: typeInscription.value,
      createdAt: typeInscription.createdAt,
      updatedAt: typeInscription.updatedAt,
    }));
  }
}
