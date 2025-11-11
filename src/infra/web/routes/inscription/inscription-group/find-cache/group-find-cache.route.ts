import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import type { GroupFindCacheInput } from 'src/usecases/inscription/group/find-cache/group-find-cache.usecase';
import { GroupFindCacheUsecase } from 'src/usecases/inscription/group/find-cache/group-find-cache.usecase';
import type {
  GroupFindCacheRequest,
  GroupFindCacheRouteResponse,
} from './group-find-cache.dto';
import { GroupFindCachePresenter } from './group-find-cache.presenter';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupFindCacheRoute {
  public constructor(private readonly findCacheGroup: GroupFindCacheUsecase) {}

  @Post('find-cache')
  @ApiOperation({ summary: 'Buscar dados do cache de inscrição em grupo' })
  public async handle(
    @Body() request: GroupFindCacheRequest,
    @UserId() accountId: string,
  ): Promise<GroupFindCacheRouteResponse> {
    const input: GroupFindCacheInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    try {
      const result = await this.findCacheGroup.execute(input);
      const response = GroupFindCachePresenter.toHttp(
        result.cacheKey,
        result.payload,
      );
      return response;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
