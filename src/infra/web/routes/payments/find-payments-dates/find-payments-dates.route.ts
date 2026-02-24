import { Controller, Get } from '@nestjs/common';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
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
