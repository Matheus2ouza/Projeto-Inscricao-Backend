import { Body, Controller, Param, Post } from '@nestjs/common';

import {
  GeneratePdfSelectedInscriptionInput,
  GeneratePdfSelectedInscriptionUsecase,
} from 'src/usecases/event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.usecase';
import type {
  GeneratePdfSelectedInscriptionsRequest,
  GeneratePdfSelectedInscriptionsResponse,
} from './generate-pdf-selected-inscriptions.dto';
import { GeneratePdfSelectedInscriptionPresenter } from './generate-pdf-selected-inscriptions.presenter';

@Controller('events/pdf')
export class GeneratePdfSelectedInscriptionRoute {
  public constructor(
    private readonly generatePdfInscriptionUsecase: GeneratePdfSelectedInscriptionUsecase,
  ) {}

  @Post(':id/list-inscription')
  async handle(
    @Param('id') eventId: string,
    @Body() body: GeneratePdfSelectedInscriptionsRequest,
  ): Promise<GeneratePdfSelectedInscriptionsResponse> {
    const input: GeneratePdfSelectedInscriptionInput = {
      eventId: eventId,
      inscriptionIds: body.inscriptionIds,
    };

    const response = await this.generatePdfInscriptionUsecase.execute(input);

    return GeneratePdfSelectedInscriptionPresenter.toHttp(response);
  }
}
