import { Controller, Get, Param } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindByIdEventInput,
  FindByIdEventUsecase,
} from 'src/usecases/web/event/find-by-id/find-by-id.usecase';
import type {
  FindByIdEventRequest,
  FindByIdEventResponse,
} from './find-by-id.dto';
import { FindByEventPresenter } from './find-by-id.presenter';

@Controller('events')
export class FindByIdEventRoute {
  public constructor(
    private readonly findByIdEventUsecase: FindByIdEventUsecase,
  ) {}

  @Get(':id')
  public async handle(
    @Param() params: FindByIdEventRequest,
    @UserInfo() user: UserInfoType,
  ): Promise<FindByIdEventResponse> {
    const input: FindByIdEventInput = {
      id: params.id,
      role: user.userRole,
    };

    const response = await this.findByIdEventUsecase.execute(input);
    return FindByEventPresenter.toHttp(response);
  }
}
