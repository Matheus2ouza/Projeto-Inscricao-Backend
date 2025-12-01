import { Controller, Get, Query } from '@nestjs/common';
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
    const input: FindAllWithPaymentsInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllWithPaymentsUsecase.execute(input);
    return FindAllWithPaymentsPresenter.toHttp(response);
  }
}
