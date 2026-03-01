import { Controller, Get } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import {
  UserInfo,
  type UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllNamesEventInput,
  FindAllnamesEventUsecase,
} from 'src/usecases/web/event/find-all-names/find-all-names.usecase';
import { FindAllNamesEventResponse } from './find-all-names-events.dto';
import { FindAllNamesEventPresenter } from './find-all-names-events.presenter';

@Controller('events')
export class FindAllNamesEventRoute {
  public constructor(
    private readonly findAllnamesEventUsecase: FindAllnamesEventUsecase,
  ) {}

  @Get('all/names')
  public async handle(
    @UserInfo() user: UserInfoType,
  ): Promise<FindAllNamesEventResponse> {
    const input: FindAllNamesEventInput = {
      regionId: user.userRole !== roleType.SUPER ? user.regionId : undefined,
    };
    const result = await this.findAllnamesEventUsecase.execute(input);
    const response = FindAllNamesEventPresenter.toHttp(result);
    return response;
  }
}
