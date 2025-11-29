import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FindAllListPreSaleInput,
  FindAllListPreSaleUsecase,
} from 'src/usecases/web/tickets/find-all-list-pre-sale/find-all-list-pre-sale.usecase';
import type {
  FindAllListPreSaleRequest,
  FindAllListPreSaleResponse,
} from './find-all-list-pre-sale.dto';
import { FindAllListPreSalePresenter } from './find-all-list-pre-sale.presenter';

@Controller('tickets')
export class FindAllListPreSaleRoute {
  constructor(
    private readonly findAllListPreSaleUsecase: FindAllListPreSaleUsecase,
  ) {}

  @Get(':eventId/list')
  async handle(
    @Param() param: FindAllListPreSaleRequest,
    @Query() query: FindAllListPreSaleRequest,
  ): Promise<FindAllListPreSaleResponse> {
    const input: FindAllListPreSaleInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const resposne = await this.findAllListPreSaleUsecase.execute(input);
    return FindAllListPreSalePresenter.toHttp(resposne);
  }
}
