import { CreateInscriptionAvulOutput } from 'src/usecases/inscriptionAvul/create/create-inscription-avul.usecase';
import { CreateInscriptionAvulResponse } from './create-inscription-avul.dto';

export class CreateInscriptionAvulPresenter {
  public static toHtpp(
    input: CreateInscriptionAvulOutput,
  ): CreateInscriptionAvulResponse {
    const aModal: CreateInscriptionAvulResponse = {
      id: input.id,
    };
    return aModal;
  }
}
