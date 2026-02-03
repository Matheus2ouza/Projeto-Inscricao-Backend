import { FindTypeInscriptionByEventIdOutput } from 'src/usecases/web/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.usecase';
import { FindTypeInscriptionByEventIdResponse } from './find-type-inscription-by-eventId.dto';

export class FindTypeInscriptionByEventIdPresenter {
  public static toHttp(
    input: FindTypeInscriptionByEventIdOutput,
  ): FindTypeInscriptionByEventIdResponse {
    return input.map((typeInscription) => ({
      id: typeInscription.id,
      description: typeInscription.description,
      rule: typeInscription.rule,
      value: typeInscription.value,
      specialType: typeInscription.specialType,
      createdAt: typeInscription.createdAt,
    }));
  }
}
