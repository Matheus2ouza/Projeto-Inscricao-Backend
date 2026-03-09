import { Controller, Get, Param } from '@nestjs/common';
import {
  GeneratePdfLocalityInput,
  GeneratePdfLocalityUseCase,
} from 'src/usecases/web/participants/pdf/generate-pdf-locality/generate-pdf-locality.usecase';
import {
  type GeneratePdfLocalityRequest,
  GeneratePdfLocalityResponse,
} from './generate-pdf-locality.dto';
import { GeneratePdfLocalityPresenter } from './generate-pdf-locality.presenter';

@Controller('participants/pdf')
export class GeneratePdfLocalityRoute {
  public constructor(
    private readonly generatePdfLocalityUsecase: GeneratePdfLocalityUseCase,
  ) {}

  @Get(':eventId/locality')
  async handle(
    @Param() param: GeneratePdfLocalityRequest,
  ): Promise<GeneratePdfLocalityResponse> {
    const input: GeneratePdfLocalityInput = {
      eventId: param.eventId,
    };
    const response = await this.generatePdfLocalityUsecase.execute(input);
    return GeneratePdfLocalityPresenter.toHttp(response);
  }
}
