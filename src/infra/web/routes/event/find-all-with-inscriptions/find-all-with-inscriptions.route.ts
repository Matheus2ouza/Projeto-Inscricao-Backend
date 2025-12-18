import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithInscriptionsInput,
  FindAllWithInscriptionsUsecase,
} from 'src/usecases/web/event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import type {
  FindAllWithInscriptionsRequest,
  FindAllWithInscriptionsResponse,
} from './find-all-with-inscriptions.dto';
import { FindAllWithInscriptionsPresenter } from './find-all-with-inscriptions.presenter';

@Controller('events')
export class FindAllWithInscriptionsRoute {
  public constructor(
    private readonly findAllwithInscriptionUsecase: FindAllWithInscriptionsUsecase,
  ) {}

  @Get('inscriptions')
  public async handle(
    @Query() query: FindAllWithInscriptionsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithInscriptionsResponse> {
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s as statusEvent)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllWithInscriptionsInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllwithInscriptionUsecase.execute(input);
    return FindAllWithInscriptionsPresenter.toHttp(response);
  }
}
