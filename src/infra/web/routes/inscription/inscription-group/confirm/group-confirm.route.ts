import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import type { GroupConfirmInput } from 'src/usecases/inscription/group/confirm/group-confirm.usecase';
import { GroupConfirmUsecase } from 'src/usecases/inscription/group/confirm/group-confirm.usecase';
import type {
  GroupConfirmRequest,
  GroupConfirmRouteResponse,
} from './group-confirm.dto';
import { GroupConfirmPresenter } from './group-confirm.presenter';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupConfirmRoute {
  public constructor(private readonly confirmGroup: GroupConfirmUsecase) {}

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar inscrições em grupo' })
  public async handle(
    @Body() request: GroupConfirmRequest,
    @UserId() accountId: string,
  ): Promise<GroupConfirmRouteResponse> {
    const input: GroupConfirmInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    try {
      const result = await this.confirmGroup.execute(input);
      const response = GroupConfirmPresenter.toHttp(result);
      return response;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
