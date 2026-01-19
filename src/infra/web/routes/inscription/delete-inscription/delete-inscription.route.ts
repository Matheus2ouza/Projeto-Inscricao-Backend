import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DeleteInscriptionInput,
  DeleteInscriptionUsecase,
} from 'src/usecases/web/inscription/delete-inscription/delete-inscription.usecase';
import type { DeleteInscriptionRequest } from './delete-inscription.dto';

@Controller('inscriptions')
export class DeleteInscriptionRoute {
  constructor(
    private readonly deleteInscriptionUsecase: DeleteInscriptionUsecase,
  ) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui uma inscrição',
    description:
      'Remove permanentemente uma inscrição do sistema. Ideal para uso durante o processo de análise ou correção de dados incorretos. ' +
      '**Atenção:** esta ação é **irreversível** (não é um soft-delete).',
  })
  @ApiResponse({
    status: 204,
    description: 'Inscrição removida com sucesso (sem conteúdo retornado).',
  })
  @ApiResponse({
    status: 404,
    description: 'Inscrição não encontrada.',
  })
  async handle(@Param() param: DeleteInscriptionRequest): Promise<void> {
    const input: DeleteInscriptionInput = {
      id: param.id,
    };
    await this.deleteInscriptionUsecase.execute(input);
  }
}
