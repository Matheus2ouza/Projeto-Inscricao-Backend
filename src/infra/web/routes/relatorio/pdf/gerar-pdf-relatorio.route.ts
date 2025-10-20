import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { GerarPdfRelatorioInput } from 'src/usecases/relatorio/pdf/gerar-pdf-relatorio.usecase';
import { GerarPdfRelatorioUsecase } from 'src/usecases/relatorio/pdf/gerar-pdf-relatorio.usecase';
import { GerarPdfRelatorioPresenter } from './gerar-pdf-relatorio.presenter';

@Controller('relatorio')
export class GerarPdfRelatorioRoute {
  public constructor(
    private readonly gerarPdfRelatorioUsecase: GerarPdfRelatorioUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Get('pdf/:eventId')
  public async handle(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    const input: GerarPdfRelatorioInput = {
      eventId,
    };

    const result = await this.gerarPdfRelatorioUsecase.execute(input);
    const response = GerarPdfRelatorioPresenter.toHttp(result);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${response.filename}"`,
    );
    res.send(response.pdfBuffer);
  }
}
