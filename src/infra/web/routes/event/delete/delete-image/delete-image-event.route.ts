import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteImageEventInput,
  DeleteImageEventUsecase,
} from 'src/usecases/web/event/delete/delete-image/delete-image-event.usecase';
import type { DeleteImageEventRequest } from './delete-image-event.dto';

@Controller('events')
export class DeleteImageEventRoute {
  public constructor(
    private readonly deleteImageEventUsecase: DeleteImageEventUsecase,
  ) {}

  @Delete(':id/delete/image')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui a imagem de um evento',
    description: 'Remove a imagem de um evento do sistema.',
  })
  @ApiResponse({
    status: 204,
    description: 'Imagem removida com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir imagem.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  async handle(@Param('id') request: DeleteImageEventRequest) {
    const input: DeleteImageEventInput = {
      eventId: request.eventId,
    };

    await this.deleteImageEventUsecase.execute(input);
  }
}
