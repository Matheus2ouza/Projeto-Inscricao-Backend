import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  SaleTicketInput,
  SaleTicketUsecase,
} from 'src/usecases/web/tickets/sale/sale-ticket.usecase';
import type {
  SaleTicketBody,
  SaleTicketParams,
  SaleTicketResponse,
} from './sale-ticket.dto';
import { SaleTicketPresenter } from './sale-ticket.presenter';

@Controller('tickets')
export class SaleTicketRoute {
  public constructor(private readonly saleTicketUsecase: SaleTicketUsecase) {}

  @Post(':eventId/sale')
  async handle(
    @Param() params: SaleTicketParams,
    @Body() request: SaleTicketBody,
    @UserInfo() user: UserInfoType,
  ): Promise<SaleTicketResponse> {
    const input: SaleTicketInput = {
      userId: user.userId,
      eventId: params.eventId,
      name: request.name,
      items: request.items,
      payments: request.payments,
    };

    const response = await this.saleTicketUsecase.execute(input);
    return SaleTicketPresenter.toHttp(response);
  }
}
