import { FindDetailsCashRegisterOutput } from 'src/usecases/web/cash-register/find-details-cash-register/find-details-cash-register.usecase';
import { FindDetailsCashRegisterResponse } from './find-details-cash-register.dto';

export class FindDetailsCashRegisterPresenter {
  public static toHttp(
    output: FindDetailsCashRegisterOutput,
  ): FindDetailsCashRegisterResponse {
    return {
      id: output.id,
      name: output.name,
      status: output.status,
      initialBalance: output.initialBalance,
      balance: output.balance,
      allocationEvents: output.allocationEvents,
      totalIncome: output.totalIncome,
      totalExpense: output.totalExpense,
      totalPix: output.totalPix,
      totalCard: output.totalCard,
      totalCash: output.totalCash,
      expectedValues: output.expectedValues,
      expectedNetValues: output.expectedNetValues,
      openedAt: output.openedAt,
      closedAt: output.closedAt,
    };
  }
}
