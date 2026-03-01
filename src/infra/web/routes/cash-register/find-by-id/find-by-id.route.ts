import { Controller, Get, Param } from '@nestjs/common';
import {
  FindDetailsCashRegisterInput,
  FindDetailsCashRegisterUsecase,
} from 'src/usecases/web/cash-register/find-details-cash-register/find-details-cash-register.usecase';
import {
  type FindDetailsCashRegisterRequest,
  FindDetailsCashRegisterResponse,
} from './find-by-id.dto';
import { FindDetailsCashRegisterPresenter } from './find-by-id.presenter';

@Controller('cash-register')
export class FindDetailsCashRegisterRoute {
  constructor(
    private readonly findDetailsCashRegisterUsecase: FindDetailsCashRegisterUsecase,
  ) {}

  @Get(':id')
  async handle(
    @Param() param: FindDetailsCashRegisterRequest,
  ): Promise<FindDetailsCashRegisterResponse> {
    const input: FindDetailsCashRegisterInput = {
      id: param.id,
    };

    const response = await this.findDetailsCashRegisterUsecase.execute(input);
    return FindDetailsCashRegisterPresenter.toHttp(response);
  }
}
