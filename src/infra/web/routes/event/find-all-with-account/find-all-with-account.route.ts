import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithAccountInput,
  FindAllWithAccountUsecase,
} from 'src/usecases/web/event/find-all-with-account/find-all-with-account.usecase';
import type {
  FindAllWithAccountRequest,
  FindAllWithAccountResponse,
} from './find-all-with-account.dto';
import { FindAllWithAccountPresenter } from './find-all-with-account.presenter';

@Controller('events')
export class FindAllWithAccountRoute {
  constructor(
    private readonly findAllWithAccountUsecase: FindAllWithAccountUsecase,
  ) {}

  @Get('accounts')
  async handle(
    @Query() query: FindAllWithAccountRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithAccountResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '4');
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s as statusEvent)
      : query.status
        ? [query.status as statusEvent]
        : [];
    const input: FindAllWithAccountInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page,
      pageSize,
    };

    const response = await this.findAllWithAccountUsecase.execute(input);
    return FindAllWithAccountPresenter.toHttp(response);
  }
}
