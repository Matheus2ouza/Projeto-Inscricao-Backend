import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  SaleGroupTicketInput,
  SaleGroupTicketUsecase,
} from 'src/usecases/web/tickets/sale-group/sale-group-ticket.usecase';
import type {
  SaleGroupTicketRequest,
  SaleGroupTicketResponse,
} from './sale-group-ticket.dto';
import { SaleGroupTicketPresenter } from './sale-group-ticket.presenter';

@Controller('ticket')
export class SaleGroupTicketRoute {
  public constructor(
    private readonly saleGroupTicketUsecase: SaleGroupTicketUsecase,
  ) {}

  @Post('sale/group')
  async handle(
    @Body() request: SaleGroupTicketRequest,
    @UserId() userId: string,
  ): Promise<SaleGroupTicketResponse> {
    const input: SaleGroupTicketInput = {
      ticketId: request.ticketId,
      accountId: userId,
      quantity: request.quantity,
      paymentMethod: request.paymentMethod,
      pricePerTicket: request.pricePerTicket,
    };

    const response = await this.saleGroupTicketUsecase.execute(input);

    return SaleGroupTicketPresenter.toHttp(response);
  }
}
