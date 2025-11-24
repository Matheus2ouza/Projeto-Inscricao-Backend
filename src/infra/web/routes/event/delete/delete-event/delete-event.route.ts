import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteEventInput,
  DeleteEventUsecase,
} from 'src/usecases/web/event/delete/delete-event/delete-event.usecase';

@Controller('events')
export class DeleteEventRoute {
  public constructor(private readonly deleteEventUsecase: DeleteEventUsecase) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um evento',
    description: 'Remove um evento do sistema.',
  })
  @ApiResponse({
    status: 204,
    description: 'Evento removido com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir evento.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  public async handle(@Param('id') id: string) {
    const input: DeleteEventInput = {
      eventId: id,
    };

    await this.deleteEventUsecase.execute(input);
  }
}
