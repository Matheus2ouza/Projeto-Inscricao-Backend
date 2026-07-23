import { Controller, Get, Param, Query } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  ListAllPaymentsInput,
  ListAllPaymentsUseCase,
} from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import type {
  ListAllPaymentsParam,
  ListAllPaymentsQuery,
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
    @Param() param: ListAllPaymentsParam,
    @UserInfo() user: UserInfoType,
    @Query() query: ListAllPaymentsQuery,
  ): Promise<ListAllPaymentsResponse> {
    const isGuestFilter =
      query.isGuest === undefined
        ? undefined
        : query.isGuest === false || query.isGuest === 'false'
          ? false
          : query.isGuest === true || query.isGuest === 'true'
            ? true
            : undefined;

    const input: ListAllPaymentsInput = {
      eventId: param.eventId,
      localityId: query.localityId,
      accountId: user.userRole === roleType.USER ? user.userId : undefined,
      isGuest: user.userRole !== roleType.USER ? isGuestFilter : false,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllPaymentsUsecase.execute(input);
    return ListAllPaymentsPresenter.toHttp(response);
  }
}
