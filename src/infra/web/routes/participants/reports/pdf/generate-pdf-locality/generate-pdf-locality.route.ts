import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GeneratePdfLocalityInput,
  GeneratePdfLocalityUsecase,
} from 'src/usecases/web/participants/reports/pdf/generate-pdf-locality/generate-pdf-locality.usecase';
import {
  type GeneratePdfLocalityParam,
  type GeneratePdfLocalityQuery,
  GeneratePdfLocalityResponse,
} from './generate-pdf-locality.dto';
import { GeneratePdfLocalityPresenter } from './generate-pdf-locality.presenter';

@Controller('participants/pdf')
export class GeneratePdfLocalityRoute {
  public constructor(
    private readonly generatePdfLocalityUsecase: GeneratePdfLocalityUsecase,
  ) {}

  @Get(':eventId/locality')
  async handle(
    @Param() param: GeneratePdfLocalityParam,
    @Query() query: GeneratePdfLocalityQuery,
  ): Promise<GeneratePdfLocalityResponse> {
    const parseBooleanQuery = (value: unknown): boolean =>
      String(value).toLowerCase() === 'true';

    const input: GeneratePdfLocalityInput = {
      eventId: param.eventId,
      separate: parseBooleanQuery(query.separate),
      reduced: parseBooleanQuery(query.reduced),
      summary: parseBooleanQuery(query.summary),
      columns: query.columns,
    };

    const response = await this.generatePdfLocalityUsecase.execute(input);
    return GeneratePdfLocalityPresenter.toHttp(response);
  }
}
