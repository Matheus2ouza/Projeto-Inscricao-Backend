import { FindTypeInscriptionByEventOutput } from 'src/usecases/web/typeInscription/find-type-inscription-by-event/find-type-inscription-by-event.usecase';
import { FindTypeInscriptionByEventResponse } from './find-type-inscription-by-event.dto';

export class FindTypeInscriptionByEventPresenter {
  public static toHttp(
    input: FindTypeInscriptionByEventOutput,
  ): FindTypeInscriptionByEventResponse {
    return input.map((typeInscription) => ({
      id: typeInscription.id,
      description: typeInscription.description,
      rule: typeInscription.rule,
      value: typeInscription.value,
      specialType: typeInscription.specialType,
      active: typeInscription.active,
      participantLimit: typeInscription.participantLimit,
      limitIsStrict: typeInscription.limitIsStrict,
      createdAt: typeInscription.createdAt,
    }));
  }
}
