import { CreateCashRegisterOutout } from 'src/usecases/web/cash-register/create-cash-register/create-cash-register.usecase';
import { CreateCashRegisterResponse } from './create-cash-register.dto';

export class CreateCashRegisterPresenter {
  public static toHttp(
    output: CreateCashRegisterOutout,
  ): CreateCashRegisterResponse {
    return {
      id: output.id,
      message: output.message,
    };
  }
}
