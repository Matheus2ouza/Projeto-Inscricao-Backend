import { FindAllListPreSaleOutput } from 'src/usecases/web/tickets/find-all-list-pre-sale/find-all-list-pre-sale.usecase';
import { FindAllListPreSaleResponse } from './find-all-list-pre-sale.dto';

export class FindAllListPreSalePresenter {
  public static toHttp(
    output: FindAllListPreSaleOutput,
  ): FindAllListPreSaleResponse {
    return {
      event: output.event,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
