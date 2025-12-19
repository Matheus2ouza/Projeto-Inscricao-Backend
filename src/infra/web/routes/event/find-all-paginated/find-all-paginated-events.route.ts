import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedEventsInput,
  FindAllPaginatedEventsUsecase,
} from 'src/usecases/web/event/find-all-event/find-all-paginated-events.usecase';
import type {
  FindAllPaginatedEventResponse,
  FindAllPaginatedEventsRequest,
} from './find-all-paginated-events.dto';
import { FindAllPaginatedEventsPresenter } from './find-all-paginated-events.presenter';

@Controller('events')
export class FindAllPaginatedEventsRoute {
  public constructor(
    private readonly findAllPaginatedEventsUsecase: FindAllPaginatedEventsUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindAllPaginatedEventsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllPaginatedEventResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s as statusEvent)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllPaginatedEventsInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page,
      pageSize,
    };

    const response = await this.findAllPaginatedEventsUsecase.execute(input);
    console.log(response);
    return FindAllPaginatedEventsPresenter.toHttp(response);
  }
}
