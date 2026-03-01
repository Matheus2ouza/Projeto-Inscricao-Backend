import { Body, Controller, Post } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  CreateCashRegisterInput,
  CreateCashRegisterUsecase,
} from 'src/usecases/web/cash-register/create-cash-register/create-cash-register.usecase';
import {
  type CreateCashRegisterRequest,
  CreateCashRegisterResponse,
} from './create-cash-register.dto';
import { CreateCashRegisterPresenter } from './create-cash-register.presenter';

@Controller('cash-register')
export class CreateCashRegisterRoute {
  constructor(
    private readonly CreateCashRegisterUsecase: CreateCashRegisterUsecase,
  ) {}

  @Post()
  async handle(
    @Body() body: CreateCashRegisterRequest,
    @UserInfo() user: UserInfoType,
  ): Promise<CreateCashRegisterResponse> {
    const input: CreateCashRegisterInput = {
      name: body.name,
      regionId:
        user.userRole !== roleType.SUPER ? user.regionId! : body.regionId,
      status: body.status,
      balance: body.balance,
      allocationEvent: body.allocationEvent,
    };

    const response = await this.CreateCashRegisterUsecase.execute(input);
    return CreateCashRegisterPresenter.toHttp(response);
  }
}
