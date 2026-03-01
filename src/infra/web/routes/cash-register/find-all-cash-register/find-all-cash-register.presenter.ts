import { FindAllCashRegisterOutput } from 'src/usecases/web/cash-register/find-all-cash-register/find-all-cash-register.usecase';
import { FindAllCashRegisterResponse } from './find-all-cash-register.dto';

export class FindAllCashRegisterPresenter {
  public static toHttp(
    output: FindAllCashRegisterOutput,
  ): FindAllCashRegisterResponse {
    return output.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      balance: c.balance,
      openedAt: c.openedAt,
      closedAt: c.closedAt,
      createdAt: c.createdAt,
    }));
  }
}
