import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindCacheGroupUsecase } from 'src/usecases/inscription/group/find-cache-group.usecase';
import type { FindCacheGroupInput } from 'src/usecases/inscription/group/find-cache-group.usecase';
import type {
  GroupFindCacheRequest,
  GroupFindCacheRouteResponse,
} from './group-find-cache.dto';
import { GroupFindCachePresenter } from './group-find-cache.presenter';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupFindCacheRoute {
  public constructor(private readonly findCacheGroup: FindCacheGroupUsecase) {}

  @Post('find-cache')
  @ApiOperation({ summary: 'Buscar dados do cache de inscrição em grupo' })
  public async handle(
    @Body() request: GroupFindCacheRequest,
    @UserId() accountId: string,
  ): Promise<GroupFindCacheRouteResponse> {
    const input: FindCacheGroupInput = {
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
