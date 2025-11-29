import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  PreSaleInput,
  PreSaleUseCase,
} from 'src/usecases/web/tickets/pre-sale/pre-sale.usecase';
import type { PreSaleRequest, PreSaleResponse } from './pre-sale.dto';
import { PreSalePresenter } from './pre-sale.presenter';

@Controller('tickets')
export class PreSaleRoute {
  constructor(private readonly preSaleUseCase: PreSaleUseCase) {}

  @IsPublic()
  @Post(':id/pre-sale')
  async handle(
    @Param('id') id: string,
    @Body() request: PreSaleRequest,
  ): Promise<PreSaleResponse> {
    const input: PreSaleInput = {
      eventId: id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      totalValue: request.totalValue,
      image: request.image,
      tickets: request.tickets,
    };

    const resposne = await this.preSaleUseCase.execute(input);
    return PreSalePresenter.toResponse(resposne);
  }
}
