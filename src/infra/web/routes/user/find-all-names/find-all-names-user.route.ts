import { Controller, Get, Query } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllNamesUserInput,
  FindAllNamesUserUsecase,
} from 'src/usecases/web/user/find-all-username/find-all-names-user.usecase';
import type {
  FindAllNamesUserQuery,
  FindAllNamesUserResponse,
} from './find-all-names-user.dto';
import { FindAllNamesUserPresenter } from './find-all-names-user.presenter';

@Controller('users')
export class FindAllNamesUserRoute {
  public constructor(
    private readonly findAllNamesUserUsecase: FindAllNamesUserUsecase,
  ) {}

  @Get('all/usernames')
  async handle(
    @UserInfo() userInfo: UserInfoType,
    @Query() query: FindAllNamesUserQuery,
  ): Promise<FindAllNamesUserResponse> {
    const input: FindAllNamesUserInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      role: userInfo.userRole,
      findRoles: query.roles,
    };

    const result = await this.findAllNamesUserUsecase.execute(input);
    return FindAllNamesUserPresenter.toHttp(result);
  }
}
