import { ApprovePreSaleOutput } from 'src/usecases/web/tickets/approve-pre-sale/approve-pre-sale.usecase';
import { ApprovePreSaleResponse } from './approve-pre-sale.dto';

export class ApprovePreSalePresenter {
  public static toHttp(output: ApprovePreSaleOutput): ApprovePreSaleResponse {
    return {
      ticketSaleId: output.ticketSaleId,
      status: output.status,
    };
  }
}
