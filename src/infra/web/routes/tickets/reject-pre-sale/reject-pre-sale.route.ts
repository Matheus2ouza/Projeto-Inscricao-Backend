import { Controller, Param, Post } from '@nestjs/common';
import {
  RejectPreSaleInput,
  RejectPreSaleUseCase,
} from 'src/usecases/web/tickets/reject-pre-sale/reject-pre-sale.usecase';
import type {
  RejectPreSaleRequest,
  RejectPreSaleResponse,
} from './reject-pre-sale.dto';
import { RejectPreSalePresenter } from './reject-pre-sale.presenter';

@Controller('tickets')
export class RejectPreSaleRoute {
  constructor(private rejectPreSaleUseCase: RejectPreSaleUseCase) {}

  @Post(':ticketSaleId/reject')
  async handle(
    @Param('ticketSaleId') param: RejectPreSaleRequest,
  ): Promise<RejectPreSaleResponse> {
    const input: RejectPreSaleInput = {
      ticketSaleId: param.ticketSaleId,
    };

    const response = await this.rejectPreSaleUseCase.execute(input);
    return RejectPreSalePresenter.toHttp(response);
  }
}
