import { Controller, Get, Param } from '@nestjs/common';
import {
  FindDetailsMovimentInput,
  FindDetailsMovimentUsecase,
} from 'src/usecases/web/cash-register/find-details-moviment/find-details-moviment.usecase';
import {
  type FindDetailsMovimentRequest,
  FindDetailsMovimentResponse,
} from './find-details-moviment.dto';
import { FindDetailsMovimentPresenter } from './find-details-moviment.presenter';

@Controller('cash-register')
export class FindDetailsMovimentRoute {
  constructor(
    private readonly findDetailsMovimentUsecase: FindDetailsMovimentUsecase,
  ) {}

  @Get('moviment/:id')
  async handle(
    @Param() param: FindDetailsMovimentRequest,
  ): Promise<FindDetailsMovimentResponse> {
    const input: FindDetailsMovimentInput = {
      id: param.id,
    };

    const response = await this.findDetailsMovimentUsecase.execute(input);
    return FindDetailsMovimentPresenter.toHttp(response);
  }
}
