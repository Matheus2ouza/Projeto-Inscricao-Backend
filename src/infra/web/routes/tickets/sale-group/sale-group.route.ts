import { Body, Controller, Param, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  SaleGrupInput,
  SaleGrupUsecase,
} from 'src/usecases/web/tickets/sale-group/sale-group.usecase';
import type {
  SaleGrupRequest,
  TicketSalePaymentResponse,
} from './sale-group.dto';
import { SaleGrupPresenter } from './sale-group.presenter';

@Controller('tickets')
export class SaleGrupRoute {
  constructor(private readonly saleGrupUsecase: SaleGrupUsecase) {}

  @Post(':eventId/sale-group')
  async handle(
    @Param() param: SaleGrupRequest,
    @Body() body: SaleGrupRequest,
    @UserId() userId: string,
  ): Promise<TicketSalePaymentResponse> {
    const input: SaleGrupInput = {
      eventId: param.eventId,
      accountId: userId,
      name: body.name,
      items: body.items,
      payments: body.payments,
    };

    const response = await this.saleGrupUsecase.execute(input);
    return SaleGrupPresenter.toHttp(response);
  }
}
