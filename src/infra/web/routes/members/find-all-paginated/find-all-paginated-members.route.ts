import { Controller, Get, Query } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedMembersInput,
  FindAllPaginatedMembersUsecase,
} from 'src/usecases/web/members/find-all-paginated/find-all-paginated-members.usecase';
import type {
  FindAllPaginatedMembersRequest,
  FindAllPaginatedMembersResponse,
} from './find-all-paginated-members.dto';
import { FindAllPaginatedMembersPresenter } from './find-all-paginated-members.presenter';

@Controller('members')
export class FindAllPaginatedMembersRoute {
  public constructor(
    private readonly findAllPaginatedMembersUsecase: FindAllPaginatedMembersUsecase,
  ) {}

  @Get()
  public async handle(
    @UserInfo() user: UserInfoType,
    @Query() query: FindAllPaginatedMembersRequest,
  ): Promise<FindAllPaginatedMembersResponse> {
    const input: FindAllPaginatedMembersInput = {
      accountId: user.userId,
      localityId: query.localityId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllPaginatedMembersUsecase.execute(input);
    return FindAllPaginatedMembersPresenter.toHttp(response);
  }
}
