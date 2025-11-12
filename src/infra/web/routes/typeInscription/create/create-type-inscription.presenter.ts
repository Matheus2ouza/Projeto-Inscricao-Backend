import { CreateTypeInscriptionOutput } from 'src/usecases/web/typeInscription/create/create-type-inscription.usecase';
import { CreateTypeInscriptionResponse } from './create-type-inscription.dto';

export class CreateTypeInscriptionPresenter {
  public static toHttp(
    input: CreateTypeInscriptionOutput,
  ): CreateTypeInscriptionResponse {
    const response: CreateTypeInscriptionResponse = {
      id: input.id,
    };
    return response;
  }
}
