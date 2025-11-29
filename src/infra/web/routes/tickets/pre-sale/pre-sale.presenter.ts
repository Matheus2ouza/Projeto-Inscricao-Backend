import { PreSaleOutput } from 'src/usecases/web/tickets/pre-sale/pre-sale.usecase';
import { PreSaleResponse } from './pre-sale.dto';

export class PreSalePresenter {
  public static toResponse(output: PreSaleOutput): PreSaleResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
