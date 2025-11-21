import { Controller, Get, Query } from '@nestjs/common';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedUsersInput,
  FindAllPaginatedUsersUsecase,
} from 'src/usecases/web/user/find-all-paginated/find-all-paginated.usecase';
import type {
  FindAllPaginatedUsersRequest,
  FindAllPaginatedUsersResponse,
} from './find-all-paginated-users.dto';
import { FindAllPaginatedUsersPresenter } from './find-all-paginated-users.presenter';

@Controller('users')
export class FindAllPaginatedUsersRoute {
  public constructor(
    private readonly findAllPaginatedUsersUsecase: FindAllPaginatedUsersUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindAllPaginatedUsersRequest,
    @UserInfo() userInfo: { role: string; regionId: string },
  ): Promise<FindAllPaginatedUsersResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const input: FindAllPaginatedUsersInput = {
      page,
      pageSize,
      regionId: userInfo.role === 'SUPER' ? undefined : userInfo.regionId,
    };

    const result = await this.findAllPaginatedUsersUsecase.execute(input);
    return FindAllPaginatedUsersPresenter.toHttp(result);
  }
}
