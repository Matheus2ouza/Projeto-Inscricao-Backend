import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  SaleTicketInput,
  SaleTicketUsecase,
} from 'src/usecases/web/tickets/sale/sale-ticket.usecase';
import type { SaleTicketRequest, SaleTicketResponse } from './sale-ticket.dto';
import { SaleTicketPresenter } from './sale-ticket.presenter';

@Controller('ticket')
export class SaleTicketRoute {
  public constructor(private readonly saleTicketUsecase: SaleTicketUsecase) {}

  @Post('sale')
  async handle(
    @Body() request: SaleTicketRequest,
    @UserId() userId: string,
  ): Promise<SaleTicketResponse> {
    const input: SaleTicketInput = {
      ticketId: request.ticketId,
      accountId: userId,
      quantity: request.quantity,
      pricePerTicket: request.pricePerTicket,
    };

    const response = await this.saleTicketUsecase.execute(input);
    return SaleTicketPresenter.toHttp(response);
  }
}
