import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  FindTicketsForSaleInput,
  FindTicketsForSaleUsecase,
} from 'src/usecases/web/tickets/find-tickets-for-sale/find-tickets-for-sale.usecase';
import type { FindTicketsForSaleResponse } from './find-tickets-for-sale.dto';
import { FindTicketsForSalePresenter } from './find-tickets-for-sale.presenter';

@Controller('tickets/public')
export class FindTicketsForSaleRoute {
  public constructor(
    private readonly findTicketsForSaleUsecase: FindTicketsForSaleUsecase,
  ) {}

  @IsPublic()
  @Get(':id')
  async handle(@Param('id') id: string): Promise<FindTicketsForSaleResponse> {
    const input: FindTicketsForSaleInput = {
      eventId: id,
    };
    const output = await this.findTicketsForSaleUsecase.execute(input);
    return FindTicketsForSalePresenter.toHttp(output);
  }
}
