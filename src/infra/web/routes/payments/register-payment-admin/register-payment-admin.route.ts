import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  RegisterPaymentAdminInput,
  RegisterPaymentAdminUsecase,
} from 'src/usecases/web/payments/register-payment-admin/register-payment-admin.usecase';
import {
  RegisterPaymentAdminBody,
  RegisterPaymentAdminResponse,
} from './register-payment-admin.dto';
import { RegisterPaymentAdminPresenter } from './register-payment-admin.presenter';

@Controller('payments')
export class RegisterPaymentAdminRoute {
  constructor(
    private readonly registerPaymentAdminUsecase: RegisterPaymentAdminUsecase,
  ) {}

  @Post('register/admin')
  @Roles(RoleTypeHierarchy.MANAGER)
  async handle(
    @Body() body: RegisterPaymentAdminBody,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<RegisterPaymentAdminResponse> {
    const input: RegisterPaymentAdminInput = {
      userId: userInfo.userId,
      amount: body.amount,
      image: body.image,
      isGuest: body.isGuest,
      accountId: body.accountId,
      guestName: body.guestName,
      inscriptions: body.inscriptions,
    };

    const response = await this.registerPaymentAdminUsecase.execute(input);
    return RegisterPaymentAdminPresenter.toHttp(response);
  }
}
