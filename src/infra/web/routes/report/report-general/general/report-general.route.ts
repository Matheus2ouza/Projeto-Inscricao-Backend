import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { ReportGeneralInput } from 'src/usecases/web/report/report-general/general/report-general.usecase';
import { ReportGeneralUsecase } from 'src/usecases/web/report/report-general/general/report-general.usecase';
import type {
  ReportGeneralRequest,
  ReportGeneralResponse,
} from './report-general.dto';
import { RelatorioGeralPresenter } from './report-general.presenter';

@Controller('report')
export class ReportGeneralRoute {
  public constructor(
    private readonly reportGeneralUsecase: ReportGeneralUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Get('/:eventId/general')
  public async handle(
    @Param() params: ReportGeneralRequest,
  ): Promise<ReportGeneralResponse> {
    const input: ReportGeneralInput = {
      eventId: params.eventId,
    };

    const response = await this.reportGeneralUsecase.execute(input);
    return RelatorioGeralPresenter.toHttp(response);
  }
}
