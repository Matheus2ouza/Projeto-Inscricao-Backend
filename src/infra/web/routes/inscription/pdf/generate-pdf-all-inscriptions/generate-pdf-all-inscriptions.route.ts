import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GeneratePdfAllInscriptionsInput,
  GeneratePdfAllInscriptionsUsecase,
} from 'src/usecases/web/inscription/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import type {
  GeneratePdfAllInscriptionsRequest,
  GeneratePdfAllInscriptionsResponse,
} from './generate-pdf-all-inscriptions.dto';
import { GeneratePdfAllInscriptionsPresenter } from './generate-pdf-all-inscriptions.presenter';

@Controller('inscriptions')
export class GeneratePdfAllInscriptionsRoute {
  constructor(
    private readonly generatePdfAllInscriptionsUsecase: GeneratePdfAllInscriptionsUsecase,
  ) {}

  @Get(':eventId/all/pdf')
  async handle(
    @Param() param: GeneratePdfAllInscriptionsRequest,
    @Query() query: GeneratePdfAllInscriptionsRequest,
  ): Promise<GeneratePdfAllInscriptionsResponse> {
    console.log('a query', query);
    const input: GeneratePdfAllInscriptionsInput = {
      eventId: param.eventId,
      isGuest: query.isGuest,
      details: query.details === 'true',
      participants: query.participants === 'true',
    };

    const response =
      await this.generatePdfAllInscriptionsUsecase.execute(input);
    return GeneratePdfAllInscriptionsPresenter.toHttp(response);
  }
}
