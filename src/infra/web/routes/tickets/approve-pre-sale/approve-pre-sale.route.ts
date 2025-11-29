import { Controller, Param, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  ApprovePreSaleInput,
  ApprovePreSaleUseCase,
} from 'src/usecases/web/tickets/approve-pre-sale/approve-pre-sale.usecase';
import type {
  ApprovePreSaleRequest,
  ApprovePreSaleResponse,
} from './approve-pre-sale.dto';
import { ApprovePreSalePresenter } from './approve-pre-sale.presenter';

@Controller('tickets')
export class ApprovePreSaleRoute {
  constructor(private readonly approvePreSaleUseCase: ApprovePreSaleUseCase) {}

  @Post(':ticketSaleId/approve')
  async handle(
    @Param() param: ApprovePreSaleRequest,
    @UserId() accountId: string,
  ): Promise<ApprovePreSaleResponse> {
    const input: ApprovePreSaleInput = {
      accountId,
      ticketSaleId: param.ticketSaleId,
    };

    console.log(input);
    const response = await this.approvePreSaleUseCase.execute(input);
    return ApprovePreSalePresenter.toHttp(response);
  }
}
