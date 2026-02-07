import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithParticipantsInput,
  FindAllWithParticipantsUsecase,
} from 'src/usecases/web/event/find-all-with-participants/find-all-with-participants.usecase';
import type {
  FindAllWithParticipantsRequest,
  FindAllWithParticipantsResponse,
} from './find-all-with-participants.dto';
import { FindAllWithParticipantsPresenter } from './find-all-with-participants.presenter';

@Controller('events')
export class FindAllWithParticipantsRoute {
  public constructor(
    private readonly findAllWithParticipantsUsecase: FindAllWithParticipantsUsecase,
  ) {}

  @Get('participants')
  async handle(
    @Query() query: FindAllWithParticipantsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithParticipantsResponse> {
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllWithParticipantsInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      guest: String(query.guest) === 'true',
      page: Number(query.page),
      pageSize: Number(query.pageSize),
    };

    const response = await this.findAllWithParticipantsUsecase.execute(input);
    return FindAllWithParticipantsPresenter.toHttp(response);
  }
}
