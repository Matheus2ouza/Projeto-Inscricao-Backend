import { Controller, Get } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllLocalityWithAccountInput,
  FindAllLocalityWithAccountUsecase,
} from 'src/usecases/web/locality/find-all-with-account/find-all-with-account.usecase';
import { FindAllLocalityWithAccountResponse } from './find-all-with-account.dto';
import { FindAllLocalityWithAccountPresenter } from './find-all-with-account.presenter';

@Controller('locality')
export class FindAllLocalityWithAccountRoute {
  public constructor(
    private readonly findAllLocalityWithAccountUsecase: FindAllLocalityWithAccountUsecase,
  ) {}

  @Get('all/account')
  public async handle(
    @UserInfo() user: UserInfoType,
  ): Promise<FindAllLocalityWithAccountResponse> {
    const input: FindAllLocalityWithAccountInput = {
      userId: user.userId,
    };

    const response =
      await this.findAllLocalityWithAccountUsecase.execute(input);
    return FindAllLocalityWithAccountPresenter.toHttp(response);
  }
}
