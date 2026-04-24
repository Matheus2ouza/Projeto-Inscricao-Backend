import { CreateNewRegisterOutput } from 'src/usecases/web/cash-register/create-new-register/create-new-register.usecase';
import { CreateNewRegisterResponse } from './create-new-register.dto';

export class CreateNewRegisterPresenter {
  public static toHttp(
    output: CreateNewRegisterOutput,
  ): CreateNewRegisterResponse {
    return {
      id: output.id,
    };
  }
}
