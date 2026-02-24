import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindPaymentsDatesInput,
  FindPaymentsDatesUsecase,
} from 'src/usecases/web/payments/find-payments-dates/find-payments-dates.usecase';
import { FindPaymentsDatesResponse } from './find-payments-dates.dto';
import { FindPaymentsDatesPresenter } from './find-payments-dates.presenter';

@Controller('payments')
export class FindPaymentsDatesRoute {
  constructor(
    private readonly findPaymentsDatesUsecase: FindPaymentsDatesUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.MANAGER)
  @Get('dates')
  async handle(
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindPaymentsDatesResponse> {
    const input: FindPaymentsDatesInput = {
      regionId: userInfo.regionId!,
    };

    const response = await this.findPaymentsDatesUsecase.execute(input);
    return FindPaymentsDatesPresenter.toHttp(response);
  }
}
