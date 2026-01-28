import { Body, Controller, Param, Post } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  RegisterCredInput,
  RegisterCredUsecase,
} from 'src/usecases/web/payments/register-cred/register-cred.usecase';
import type {
  RegisterCredRequest,
  RegisterCredResponse,
} from './register-cred.dto';
import { RegisterCredPresenter } from './register-cred.presenter';

@Controller('payments')
export class RegisterCredRoute {
  constructor(private readonly registerCredUsecase: RegisterCredUsecase) {}

  @Post(':eventId/register/cred')
  async handle(
    @Param() param: RegisterCredRequest,
    @Body() body: RegisterCredRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<RegisterCredResponse> {
    const input: RegisterCredInput = {
      eventId: param.eventId,
      accountId: userInfo?.userId || body.accountId,
      totalValue: body.totalValue,
      client: body.client,
      inscriptions: body.inscriptions,
    };

    const response = await this.registerCredUsecase.execute(input);
    return RegisterCredPresenter.toHttp(response);
  }
}
