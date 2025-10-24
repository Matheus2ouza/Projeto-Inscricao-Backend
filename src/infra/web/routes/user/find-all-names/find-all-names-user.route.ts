import { Controller, Get } from '@nestjs/common';
import { FindAllNamesUserUsecase } from 'src/usecases/user/find-all-username/find-all-names-user.usecase';
import { FindAllNamesUserResponse } from './find-all-names-user.dto';
import { FindAllNamesUserPresenter } from './find-all-names-user.presenter';

@Controller('users')
export class FindAllNamesUserRoute {
  public constructor(
    private readonly findAllNamesUserUsecase: FindAllNamesUserUsecase,
  ) {}

  @Get('all/usernames')
  async handle(): Promise<FindAllNamesUserResponse> {
    const result = await this.findAllNamesUserUsecase.execute();
    const response = FindAllNamesUserPresenter.toHttp(result);
    return response;
  }
}
