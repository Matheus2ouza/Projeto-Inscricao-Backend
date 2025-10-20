import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { RelatorioGeralInput } from 'src/usecases/relatorio/geral/relatorio-geral.usecase';
import { RelatorioGeralUsecase } from 'src/usecases/relatorio/geral/relatorio-geral.usecase';
import type { RelatorioGeralResponse } from './relatorio-geral.dto';
import { RelatorioGeralPresenter } from './relatorio-geral.presenter';

@Controller('relatorio')
export class RelatorioGeralRoute {
  public constructor(
    private readonly relatorioGeralUsecase: RelatorioGeralUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Get('geral/:eventId')
  public async handle(
    @Param('eventId') eventId: string,
  ): Promise<RelatorioGeralResponse> {
    const input: RelatorioGeralInput = {
      eventId,
    };

    const result = await this.relatorioGeralUsecase.execute(input);

    const response = RelatorioGeralPresenter.toHttp(result);
    return response;
  }
}
