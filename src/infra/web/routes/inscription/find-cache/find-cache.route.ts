import { Controller, Get, Query } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  FindCacheInput,
  FindCacheUsecase,
} from 'src/usecases/web/inscription/find-cache/find-cache.usecase';
import type { FindCacheRequest, FindCacheResponse } from './find-cache.dto';
import { FindCachePresenter } from './find-cache.presenter';

@Controller('inscriptions')
export class FindCacheRoute {
  public constructor(private readonly findCacheUsecase: FindCacheUsecase) {}

  @Get('cache')
  async handle(
    @Query() query: FindCacheRequest,
    @UserId() accountId: string,
  ): Promise<FindCacheResponse> {
    const input: FindCacheInput = {
      accountId: accountId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findCacheUsecase.execute(input);
    return FindCachePresenter.toHttp(response);
  }
}
