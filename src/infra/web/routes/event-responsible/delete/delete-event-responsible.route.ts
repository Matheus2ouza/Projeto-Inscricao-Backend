import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteEventResponsibleInput,
  DeleteEventResponsibleUseCase,
} from 'src/usecases/web/event-responsible/delete-event-responsible.usecase';

@Controller('event-responsibles')
export class DeleteEventResponsibleRoute {
  public constructor(
    private readonly deleteEventResponsibleUsecase: DeleteEventResponsibleUseCase,
  ) {}

  @Delete(':eventId/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui um responsável de evento',
    description: 'Remove um responsável de evento do sistema.',
  })
  @ApiResponse({
    status: 204,
    description:
      'Responsável de evento removido com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Responsável de evento não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir responsável de evento.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  public async handle(
    @Param('eventId') eventId: string,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    const input: DeleteEventResponsibleInput = {
      eventId: eventId,
      accountId: accountId,
    };
    await this.deleteEventResponsibleUsecase.execute(input);
  }
}
