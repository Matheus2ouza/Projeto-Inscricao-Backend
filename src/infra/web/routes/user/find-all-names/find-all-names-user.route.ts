import { Controller, Get } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllNamesUserInput,
  FindAllNamesUserUsecase,
} from 'src/usecases/web/user/find-all-username/find-all-names-user.usecase';
import type { FindAllNamesUserResponse } from './find-all-names-user.dto';
import { FindAllNamesUserPresenter } from './find-all-names-user.presenter';

@Controller('users')
export class FindAllNamesUserRoute {
  public constructor(
    private readonly findAllNamesUserUsecase: FindAllNamesUserUsecase,
  ) {}

  @Get('all/usernames')
  async handle(
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllNamesUserResponse> {
    const input: FindAllNamesUserInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      role: userInfo.userRole,
    };

    const result = await this.findAllNamesUserUsecase.execute(input);
    return FindAllNamesUserPresenter.toHttp(result);
  }
}
