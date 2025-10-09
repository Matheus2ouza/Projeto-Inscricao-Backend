import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfirmGroupUsecase } from 'src/usecases/inscription/group/confirm-group.usecase';
import type { ConfirmGroupInput } from 'src/usecases/inscription/group/confirm-group.usecase';
import type {
  GroupConfirmRequest,
  GroupConfirmRouteResponse,
} from './group-confirm.dto';
import { GroupConfirmPresenter } from './group-confirm.presenter';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupConfirmRoute {
  public constructor(private readonly confirmGroup: ConfirmGroupUsecase) {}

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar inscrições em grupo' })
  public async handle(
    @Body() request: GroupConfirmRequest,
    @UserId() accountId: string,
  ): Promise<GroupConfirmRouteResponse> {
    console.log(request);
    console.log(accountId);

    const input: ConfirmGroupInput = {
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
