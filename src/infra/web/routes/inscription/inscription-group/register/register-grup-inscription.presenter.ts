import { RegisterGroupInscriptionUsecaseOutput } from 'src/usecases/web/inscription/group/register/register-grup-inscription.usecase';
import { RegisterGroupInscriptionUsecaseResponse } from './register-grup-inscription.dto';

export class RegisterGroupInscriptionPresenter {
  static toHttp(
    output: RegisterGroupInscriptionUsecaseOutput,
  ): RegisterGroupInscriptionUsecaseResponse {
    return {
      inscriptionId: output.id,
    };
  }
}
