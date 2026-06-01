import { ReceiveSyncCashRegisterOutput } from 'src/usecases/web/sync/receive-sync-cash-register/receive-sync-cash-register.usecase';
import { ReceiveSyncCashRegisterResponse } from './receive-sync-cash-register.dto';

export class ReceiveSyncCashRegisterPresenter {
  public static toHttp(
    output: ReceiveSyncCashRegisterOutput,
  ): ReceiveSyncCashRegisterResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
