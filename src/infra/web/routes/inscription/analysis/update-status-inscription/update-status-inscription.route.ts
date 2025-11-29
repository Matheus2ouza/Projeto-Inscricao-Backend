import { Controller, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  UpdateStatusInscriptionInput,
  UpdateStatusInscriptionUsecase,
} from 'src/usecases/web/inscription/analysis/update-status-inscription/update-status-inscription.usecase';
import type {
  UpdateStatusInscriptionRequest,
  UpdateStatusInscriptionResponse,
} from './update-status-inscription.dto';
import { UpdateStatusInscriptionPresenter } from './update-status-inscription.presenter';

@Controller('inscriptions')
export class UpdateStatusInscriptionRoute {
  public constructor(
    private readonly updateStatusUsecase: UpdateStatusInscriptionUsecase,
  ) {}

  @Patch(':id/update')
  @ApiOperation({
    summary: 'Atualiza o status de uma inscrição (análise)',
    description:
      'Permite ao administrador alterar o status de uma inscrição específica durante o processo de análise. ' +
      'O ID é passado via parâmetro e o novo status via query (ex: APPROVED, CANCELLED, PENDING).',
  })
  async handle(
    @Param('id') id: string,
    @Query() query: UpdateStatusInscriptionRequest,
  ): Promise<UpdateStatusInscriptionResponse> {
    const input: UpdateStatusInscriptionInput = {
      inscriptionId: id,
      statusInscription: query.status,
    };

    const response = await this.updateStatusUsecase.execute(input);
    return UpdateStatusInscriptionPresenter.toHttp(response);
  }
}
