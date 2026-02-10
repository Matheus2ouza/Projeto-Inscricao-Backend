import { Controller, Get, Query } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithPaymentsInput,
  FindAllWithPaymentsUsecase,
} from 'src/usecases/web/event/find-all-with-payments/find-all-with-payments.usecase';
import type {
  FindAllWithPaymentsRequest,
  FindAllWithPaymentsResponse,
} from './find-all-with-payments.dto';
import { FindAllWithPaymentsPresenter } from './find-all-with-payments.presenter';

@Controller('events')
export class FindAllWithPaymentsRoute {
  constructor(
    private readonly findAllWithPaymentsUsecase: FindAllWithPaymentsUsecase,
  ) {}

  @Get('payments')
  async handle(
    @Query() query: FindAllWithPaymentsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithPaymentsResponse> {
    const paymentEnabled =
      query.paymentEnabled === undefined
        ? undefined
        : query.paymentEnabled === 'true';

    const input: FindAllWithPaymentsInput = {
      regionId:
        userInfo.userRole === roleType.SUPER ? undefined : userInfo.regionId,
      role: userInfo.userRole,
      paymentEnabled,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllWithPaymentsUsecase.execute(input);
    return FindAllWithPaymentsPresenter.toHttp(response);
  }
}
