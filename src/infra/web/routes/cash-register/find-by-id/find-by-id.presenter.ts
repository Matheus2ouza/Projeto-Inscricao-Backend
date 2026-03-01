import { FindDetailsCashRegisterOutput } from 'src/usecases/web/cash-register/find-details-cash-register/find-details-cash-register.usecase';
import { FindDetailsCashRegisterResponse } from './find-by-id.dto';

export class FindDetailsCashRegisterPresenter {
  public static toHttp(
    output: FindDetailsCashRegisterOutput,
  ): FindDetailsCashRegisterResponse {
    return {
      id: output.id,
      name: output.name,
      status: output.status,
      balance: output.balance,
      allocationEvents: output.allocationEvents,
      openedAt: output.openedAt,
      closedAt: output.closedAt,
    };
  }
}
