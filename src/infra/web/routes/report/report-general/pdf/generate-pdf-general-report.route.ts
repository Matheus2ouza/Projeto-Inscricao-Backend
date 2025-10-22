import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  GeneratePdfGeneralReportInput,
  GeneratePdfGeneralReportUsecase,
} from 'src/usecases/report/report-general/pdf/generate-pdf-general-report.usecase';
import type { GeneratePdfGeneralReportResponse } from './generate-pdf-general-report.dto';
import { GeneratePdfGeneralReportPresenter } from './generate-pdf-general-report.presenter';

@Controller('report')
export class GeneratePdfGeneralReportRoute {
  public constructor(
    private readonly generatePdfGeneralReportUsecase: GeneratePdfGeneralReportUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Get('pdf/:eventId')
  public async handle(
    @Param('eventId') eventId: string,
  ): Promise<GeneratePdfGeneralReportResponse> {
    const input: GeneratePdfGeneralReportInput = {
      eventId,
    };

    const result = await this.generatePdfGeneralReportUsecase.execute(input);
    const response = GeneratePdfGeneralReportPresenter.toHttp(result);

    return response;
  }
}
