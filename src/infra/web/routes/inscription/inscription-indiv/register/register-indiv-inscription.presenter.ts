import { RegisterIndivInscriptionUsecaseOutput } from 'src/usecases/web/inscription/indiv/register/register-indiv-inscription.usecase';
import { RegisterIndivInscriptionUsecaseResponse } from './register-indiv-inscription.dto';

export class RegisterIndivInscriptionPresenter {
  public static toHttp(
    output: RegisterIndivInscriptionUsecaseOutput,
  ): RegisterIndivInscriptionUsecaseResponse {
    return {
      inscriptionId: output.id,
    };
  }
}
