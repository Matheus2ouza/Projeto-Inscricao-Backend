import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import { FindDetailsInscriptionUsecase } from 'src/usecases/inscription/find-details-inscription/find-details-inscription.usecase';
import type {
  FindDetailsInscriptionRequest,
  FindDetailsInscriptionResponse,
} from './find-details-inscription.dto';
import { FindDetailsInscriptionPresenter } from './find-details-inscription.presenter';

@Controller('inscriptions')
export class FindDetailsInscriptionRoute {
  public constructor(
    private readonly findDetailsInscriptionUsecase: FindDetailsInscriptionUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.USER)
  @Get(':id')
  @ApiOperation({
    summary: 'Retorna os detalhes completos de uma inscrição',
    description:
      'Busca e retorna todas as informações relacionadas a uma inscrição específica com base no seu ID. Inclui dados do responsável, participantes e pagamentos vinculados.',
  })
  async handle(
    @Param() params: FindDetailsInscriptionRequest,
  ): Promise<FindDetailsInscriptionResponse> {
    const id = String(params.id);
    const result = await this.findDetailsInscriptionUsecase.execute({ id });
    const response = FindDetailsInscriptionPresenter.toHttp(result);
    return response;
  }
}
