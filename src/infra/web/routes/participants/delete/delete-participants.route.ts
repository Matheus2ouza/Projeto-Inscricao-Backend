import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteParticipantsInput,
  DeleteParticipantsUsecase,
} from 'src/usecases/web/participants/delete/delete-participants.usecase';

@Controller('participants')
export class DeleteParticipantsRoute {
  public constructor(
    private readonly deleteParticipantsUsecase: DeleteParticipantsUsecase,
  ) {}

  @Delete(':id/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um participante de uma inscrição',
    description: 'Remove um participante de uma inscrição do sistema.',
  })
  @ApiResponse({
    status: 204,
    description: 'Participante removido com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Participante não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir participante.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  async handle(@Param('id') participantId: string): Promise<void> {
    const input: DeleteParticipantsInput = {
      participantId: participantId,
    };
    await this.deleteParticipantsUsecase.execute(input);
  }
}
