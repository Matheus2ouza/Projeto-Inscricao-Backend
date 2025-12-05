import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  GeneratePdfEtiquetaInput,
  GeneratePdfEtiquetaUseCase,
} from 'src/usecases/web/participants/pdf/generate-pdf-etiqueta/generate-pdf-etiqueta.usecase';
import type {
  GeneratePdfEtiquetaRequest,
  GeneratePdfEtiquetaResponse,
} from './generate-pdf-etiqueta.dto';
import { GeneratePdfEtiquetaPresenter } from './generate-pdf-etiqueta.presenter';

@Controller('participants/pdf')
export class GeneratePdfEtiquetaRoute {
  constructor(
    private readonly generatePdfEtiquetaUsecase: GeneratePdfEtiquetaUseCase,
  ) {}

  @Post(':eventId/etiqueta')
  async handle(
    @Param() param: GeneratePdfEtiquetaRequest,
    @Body() body: GeneratePdfEtiquetaRequest,
  ): Promise<GeneratePdfEtiquetaResponse> {
    const input: GeneratePdfEtiquetaInput = {
      eventId: param.eventId,
      accountsId: body.accountsId,
    };

    const response = await this.generatePdfEtiquetaUsecase.execute(input);
    return GeneratePdfEtiquetaPresenter.toHttp(response);
  }
}
