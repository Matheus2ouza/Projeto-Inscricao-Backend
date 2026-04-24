import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GenerateXlsxLocalityInput,
  GenerateXlsxLocalityUsecase,
} from 'src/usecases/web/participants/reports/xlsx/generate-xlsx-locality/generate-xlsx-locality.usecase';
import {
  GenerateXlsxLocalityParam,
  GenerateXlsxLocalityQuery,
  GenerateXlsxLocalityResponse,
} from './generate-xlsx-locality.dto';
import { GenerateXlsxLocalityPresenter } from './generate-xlsx-locality.presenter';

@Controller('participants/xlsx')
export class GenerateXlsxLocalityRoute {
  constructor(
    private readonly generateXlsxLocalityUsecase: GenerateXlsxLocalityUsecase,
  ) {}

  @Get(':eventId/locality')
  async handle(
    @Param() param: GenerateXlsxLocalityParam,
    @Query() query: GenerateXlsxLocalityQuery,
  ): Promise<GenerateXlsxLocalityResponse> {
    const parseBooleanQuery = (value: unknown): boolean =>
      String(value).toLowerCase() === 'true';

    const input: GenerateXlsxLocalityInput = {
      eventId: param.eventId,
      separate: parseBooleanQuery(query.separate),
      summary: parseBooleanQuery(query.summary),
      typeInscriptions: query.typeInscriptions,
      columns: query.columns,
    };

    const response = await this.generateXlsxLocalityUsecase.execute(input);
    return GenerateXlsxLocalityPresenter.toHttp(response);
  }
}
