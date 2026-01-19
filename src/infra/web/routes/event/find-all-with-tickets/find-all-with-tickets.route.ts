import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithTicketsInput,
  FindAllWithTicketsUsecase,
} from 'src/usecases/web/event/find-all-with-tickets/find-all-with-tickets.usecase';
import type {
  FindAllWithTicketsRequest,
  FindAllWithTicketsResponse,
} from './find-all-with-tickets.dto';
import { FindAllWithTicketsPresenter } from './find-all-with-tickets.presenter';

@Controller('events')
export class FindAllWithTicketsRoute {
  public constructor(
    private readonly findAllWithTicketsUsecase: FindAllWithTicketsUsecase,
  ) {}

  @Get('tickets')
  async handle(
    @Query() query: FindAllWithTicketsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithTicketsResponse> {
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s)
      : query.status
        ? [query.status as statusEvent]
        : [];
    const input: FindAllWithTicketsInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllWithTicketsUsecase.execute(input);
    return FindAllWithTicketsPresenter.toHttp(response);
  }
}
