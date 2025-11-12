import { Controller, Get, Query } from '@nestjs/common';
import { FindAllNamesUserUsecase } from 'src/usecases/web/user/find-all-username/find-all-names-user.usecase';
import { FindAllNamesUserResponse } from './find-all-names-user.dto';
import { FindAllNamesUserPresenter } from './find-all-names-user.presenter';

@Controller('users')
export class FindAllNamesUserRoute {
  public constructor(
    private readonly findAllNamesUserUsecase: FindAllNamesUserUsecase,
  ) {}

  @Get('all/usernames')
  async handle(
    @Query('role') role?: string[] | string,
  ): Promise<FindAllNamesUserResponse> {
    const roles = Array.isArray(role)
      ? role.map((r) => r.trim())
      : role
        ? role.split(',').map((r) => r.trim()) // permite ?role=ADMIN,USER
        : [];

    const result = await this.findAllNamesUserUsecase.execute({ roles });
    return FindAllNamesUserPresenter.toHttp(result);
  }
}
