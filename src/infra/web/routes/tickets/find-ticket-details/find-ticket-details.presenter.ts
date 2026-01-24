import { FindTicketDetailsOutput } from 'src/usecases/web/tickets/find-ticket-details/find-ticket-details.usecase';
import { FindTicketDetailsResponse } from './find-ticket-details.dto';

export class FindTicketDetailsPresenter {
  public static toHttp(
    output: FindTicketDetailsOutput,
  ): FindTicketDetailsResponse {
    const aModal: FindTicketDetailsResponse = {
      id: output.id,
      name: output.name,
      description: output.description,
      quantity: output.quantity,
      price: output.price,
      available: output.available,
      expirationDate: output.expirationDate,
      isActive: output.isActive,
      TicketSaleItens: output.TicketSaleItens.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
      ticketSalePayments: output.ticketSalePayments.map((payment) => ({
        id: payment.id,
        paymentMethod: payment.paymentMethod,
        value: payment.value,
        createdAt: payment.createdAt,
      })),
    };
    return aModal;
  }
}
