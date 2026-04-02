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
    const input: GenerateXlsxLocalityInput = {
      eventId: param.eventId,
      separate: query.separate === 'true',
    };

    const response = await this.generateXlsxLocalityUsecase.execute(input);
    return GenerateXlsxLocalityPresenter.toHttp(response);
  }
}
