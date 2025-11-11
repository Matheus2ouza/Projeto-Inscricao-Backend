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
import type { IndivCancelInput } from 'src/usecases/inscription/indiv/cancel/indiv-cancel.usecase';
import { IndivCancelUsecase } from 'src/usecases/inscription/indiv/cancel/indiv-cancel.usecase';
import type { IndivCancelRequest } from './indiv-cancel.dto';

@ApiTags('Inscription Indiv')
@Controller('inscriptions/indiv')
export class IndivCancelRoute {
  public constructor(private readonly indivCancelUsecase: IndivCancelUsecase) {}

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar inscrição individual' })
  @ApiResponse({
    status: 200,
    description: 'Cache de inscrição individual cancelado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao cancelar (cache não encontrado, acesso negado, etc.)',
  })
  public async handle(
    @Body() request: IndivCancelRequest,
    @UserId() accountId: string,
  ): Promise<void> {
    const input: IndivCancelInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    try {
      await this.indivCancelUsecase.execute(input);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(msg);
    }
  }
}
