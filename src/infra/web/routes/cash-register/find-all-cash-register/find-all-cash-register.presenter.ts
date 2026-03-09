import { FindAllCashRegisterOutput } from 'src/usecases/web/cash-register/find-all-cash-register/find-all-cash-register.usecase';
import { FindAllCashRegisterResponse } from './find-all-cash-register.dto';

export class FindAllCashRegisterPresenter {
  public static toHttp(
    output: FindAllCashRegisterOutput,
  ): FindAllCashRegisterResponse {
    return {
      cashRegisters: output.cashRegisters,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
