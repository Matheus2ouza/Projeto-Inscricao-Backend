import { Controller, Get } from '@nestjs/common';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllCashRegisterInput,
  FindAllCashRegisterUsecase,
} from 'src/usecases/web/cash-register/find-all-cash-register/find-all-cash-register.usecase';
import { FindAllCashRegisterResponse } from './find-all-cash-register.dto';
import { FindAllCashRegisterPresenter } from './find-all-cash-register.presenter';

@Controller('cash-register')
export class FindAllCashRegisterRoute {
  constructor(
    private readonly findAllCashRegisterUsecase: FindAllCashRegisterUsecase,
  ) {}

  @Get()
  async handle(
    @UserInfo() user: UserInfoType,
  ): Promise<FindAllCashRegisterResponse> {
    const input: FindAllCashRegisterInput = {
      regionId: user.regionId,
    };

    const response = await this.findAllCashRegisterUsecase.execute(input);
    return FindAllCashRegisterPresenter.toHttp(response);
  }
}
