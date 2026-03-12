import { CreateInscriptionAdminOutput } from 'src/usecases/web/inscription/create-inscription-admin/create-inscription-admin.usecase';
import { CreateInscriptionAdminResponse } from './create-inscription-admin.dto';

export class CreateInscriptionAdminPresenter {
  public static toHttp(
    output: CreateInscriptionAdminOutput,
  ): CreateInscriptionAdminResponse {
    return {
      id: output.id,
    };
  }
}
