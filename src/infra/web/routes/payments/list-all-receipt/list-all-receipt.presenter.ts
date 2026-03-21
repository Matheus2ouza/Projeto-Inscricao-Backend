import { ListAllReceiptOutput } from 'src/usecases/web/payments/list-all-receipt/list-all-receipt.usecase';
import { ListAllReceiptResponse } from './list-all-receipt.dto';

export class ListAllReceiptPresenter {
  public static toHttp(output: ListAllReceiptOutput): ListAllReceiptResponse {
    return {
      receipts: output.receipts,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
