import { Controller, Get, Param, Query } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  ListAllPaymentsInput,
  ListAllPaymentsUseCase,
} from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import type {
  ListAllPaymentsRequest,
  ListAllPaymentsResponse,
} from './list-all-payments.dto';
import { ListAllPaymentsPresenter } from './list-all-payments.presenter';

@Controller('payments')
export class ListAllPaymentsRoute {
  constructor(
    private readonly listAllPaymentsUsecase: ListAllPaymentsUseCase,
  ) {}

  @Get(':eventId/list')
  async handle(
    @Param() param: ListAllPaymentsRequest,
    @UserInfo() userInfo: UserInfoType,
    @Query() query: ListAllPaymentsRequest,
  ): Promise<ListAllPaymentsResponse> {
    const input: ListAllPaymentsInput = {
      eventId: param.eventId,
      accountId:
        userInfo.userRole === roleType.USER ? userInfo.userId : undefined,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllPaymentsUsecase.execute(input);
    return ListAllPaymentsPresenter.toHttp(response);
  }
}
