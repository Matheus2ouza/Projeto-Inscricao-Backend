import { Controller, Get, Query } from '@nestjs/common';
import {
  FindAllNamesUserInput,
  FindAllNamesUserUsecase,
} from 'src/usecases/web/user/find-all-username/find-all-names-user.usecase';
import type {
  FindAllNamesUserRequest,
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
    @Query() query: FindAllNamesUserRequest,
  ): Promise<FindAllNamesUserResponse> {
    const input: FindAllNamesUserInput = {
      roles:
        query.roles === undefined
          ? undefined
          : Array.isArray(query.roles)
            ? query.roles
            : [query.roles],
    };

    const result = await this.findAllNamesUserUsecase.execute(input);
    return FindAllNamesUserPresenter.toHttp(result);
  }
}
