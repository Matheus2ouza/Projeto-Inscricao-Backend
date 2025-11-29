import { RejectPreSaleOutput } from 'src/usecases/web/tickets/reject-pre-sale/reject-pre-sale.usecase';

export class RejectPreSalePresenter {
  static toHttp(output: RejectPreSaleOutput) {
    return {
      ticketSaleId: output.ticketSaleId,
      status: output.status,
    };
  }
}
