import { FindFutureReleasesCashRegisterOutput } from 'src/usecases/web/cash-register/find-future-releases-cash-register/find-future-releases-cash-register.usecase';
import { FindFutureReleasesCashRegisterResponse } from './find-future-releases-cash-register.dto';

export class FindFutureReleasesCashRegisterPresenter {
  static toHttp(
    output: FindFutureReleasesCashRegisterOutput,
  ): FindFutureReleasesCashRegisterResponse {
    return output.map((item) => ({
      releaseDate: item.releaseDate,
      amount: item.amount,
    }));
  }
}
