import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedEventToInscriptionInput,
  FindAllPaginatedEventToInscriptionUsecase,
} from 'src/usecases/web/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import type {
  FindAllPaginatedEventToInscriptionRequest,
  FindAllPaginatedEventToInscriptionResponse,
} from './find-all-paginated-events-to-inscription.dto';
import { FindAllPaginatedEventToInscriptionPresenter } from './find-all-paginated-events-to-inscription.presenter';

@Controller('events')
export class FindAllPaginatedEventToInscriptionRoute {
  public constructor(
    private readonly findAllPaginatedEventToInscriptionUsecase: FindAllPaginatedEventToInscriptionUsecase,
  ) {}

  @Get('analysis/inscription')
  public async handle(
    @Query() query: FindAllPaginatedEventToInscriptionRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllPaginatedEventToInscriptionResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s as statusEvent)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllPaginatedEventToInscriptionInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      page,
      pageSize,
      status,
    };

    const result =
      await this.findAllPaginatedEventToInscriptionUsecase.execute(input);
    return FindAllPaginatedEventToInscriptionPresenter.toHttp(result);
  }
}
