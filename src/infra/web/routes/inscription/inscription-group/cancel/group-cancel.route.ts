import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import type { GroupCancelInput } from 'src/usecases/web/inscription/group/cancel/group-cancel.usecase';
import { GroupCancelUsecase } from 'src/usecases/web/inscription/group/cancel/group-cancel.usecase';
import type { GroupCancelRequest } from './group-cancel.dto';

@ApiTags('Inscription Group')
@Controller('inscriptions/group')
export class GroupCancelRoute {
  public constructor(private readonly groupCancelUsecase: GroupCancelUsecase) {}

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar inscrições em grupo' })
  @ApiResponse({
    status: 200,
    description: 'Cache de inscrição em grupo cancelado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao cancelar (cache não encontrado, acesso negado, etc.)',
  })
  public async handle(
    @Body() request: GroupCancelRequest,
    @UserId() accountId: string,
  ): Promise<void> {
    const input: GroupCancelInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    try {
      await this.groupCancelUsecase.execute(input);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
