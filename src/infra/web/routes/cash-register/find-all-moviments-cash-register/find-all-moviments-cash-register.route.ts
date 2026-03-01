import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FindAllMovimentsCashRegisterInput,
  FindAllMovimentsCashRegisterUsecase,
} from 'src/usecases/web/cash-register/find-all-moviments-cash-register/find-all-moviments-cash-register.usecase';
import {
  type FindAllMovimentsCashRegisterRequest,
  FindAllMovimentsCashRegisterResponse,
} from './find-all-moviments-cash-register.dto';
import { FindAllMovimentsCashRegisterPresenter } from './find-all-moviments-cash-register.presenter';

@Controller('cash-register')
export class FindAllMovimentsCashRegisterRoute {
  constructor(
    private readonly findAllMovimentsCashRegisterUsecase: FindAllMovimentsCashRegisterUsecase,
  ) {}

  @Get(':id/moviments')
  async handle(
    @Param() param: FindAllMovimentsCashRegisterRequest,
    @Query() query: FindAllMovimentsCashRegisterRequest,
  ): Promise<FindAllMovimentsCashRegisterResponse> {
    const input: FindAllMovimentsCashRegisterInput = {
      id: param.id,
      type: query.type,
      limitTime: query.limitTime,
      orderBy: query.orderBy,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response =
      await this.findAllMovimentsCashRegisterUsecase.execute(input);
    return FindAllMovimentsCashRegisterPresenter.toHttp(response);
  }
}
