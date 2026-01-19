import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedEventToPaymentInput,
  FindAllPaginatedEventToPaymentUsecase,
} from 'src/usecases/web/event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import type {
  FindAllPaginatedEventToPaymentRequest,
  FindAllPaginatedEventToPaymentResponse,
} from './find-all-paginated-events-to-payments.dto';
import { FindAllPaginatedEventToPaymentPresenter } from './find-all-paginated-events-to-payments.presenter';

@Controller('events')
export class FindAllPaginatedEventToPaymentRoute {
  public constructor(
    private readonly findAllPaginatedEventToPaymentUsecase: FindAllPaginatedEventToPaymentUsecase,
  ) {}

  @Get('analysis/payment')
  async handle(
    @Query() query: FindAllPaginatedEventToPaymentRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllPaginatedEventToPaymentResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllPaginatedEventToPaymentInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page,
      pageSize,
    };

    const result =
      await this.findAllPaginatedEventToPaymentUsecase.execute(input);
    return FindAllPaginatedEventToPaymentPresenter.toHttp(result);
  }
}
