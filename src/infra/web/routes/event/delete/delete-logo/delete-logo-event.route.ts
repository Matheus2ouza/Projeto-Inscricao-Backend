import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteLogoEventInput,
  DeleteLogoEventUsecase,
} from 'src/usecases/web/event/delete/delete-logo/delete-logo-event.usecase';

@Controller('events')
export class DeleteLogoEventRoute {
  public constructor(
    private readonly deleteLogoEventUsecase: DeleteLogoEventUsecase,
  ) {}

  @Delete(':id/delete/logo')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui o logo de um evento',
    description: 'Remove o logo de um evento do sistema.',
  })
  @ApiResponse({
    status: 204,
    description: 'Logo removido com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir logo.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  async handle(@Param('id') id: string) {
    const input: DeleteLogoEventInput = {
      eventId: id,
    };

    await this.deleteLogoEventUsecase.execute(input);
  }
}
