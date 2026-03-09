import { Controller, Get, Param } from '@nestjs/common';
import {
  FindFutureReleasesCashRegisterInput,
  FindFutureReleasesCashRegisterUsecase,
} from 'src/usecases/web/cash-register/find-future-releases-cash-register/find-future-releases-cash-register.usecase';
import {
  type FindFutureReleasesCashRegisterRequest,
  FindFutureReleasesCashRegisterResponse,
} from './find-future-releases-cash-register.dto';
import { FindFutureReleasesCashRegisterPresenter } from './find-future-releases-cash-register.presenter';

@Controller('cash-register')
export class FindFutureReleasesCashRegisterRoute {
  constructor(
    private readonly findFutureReleasesCashRegisterUsecase: FindFutureReleasesCashRegisterUsecase,
  ) {}

  @Get(':id/future-releases')
  async handle(
    @Param() param: FindFutureReleasesCashRegisterRequest,
  ): Promise<FindFutureReleasesCashRegisterResponse> {
    const input: FindFutureReleasesCashRegisterInput = {
      id: param.id,
    };

    const response =
      await this.findFutureReleasesCashRegisterUsecase.execute(input);
    return FindFutureReleasesCashRegisterPresenter.toHttp(response);
  }
}
