import { Controller, Get, Param } from '@nestjs/common';
import {
  GeneratePdfDetailsInscriptionUsecase,
  type GeneratePdfDetailsInscriptionInput,
} from 'src/usecases/web/inscription/reports/pdf/generate-pdf-details-guest-inscription/generate-pdf-details-guest-inscription.usecase';
import type {
  GeneratePdfDetailsInscriptionRequest,
  GeneratePdfDetailsInscriptionResponse,
} from './generate-pdf-details-inscription.dto';
import { GeneratePdfDetailsInscriptionPresenter } from './generate-pdf-details-inscription.presenter';

@Controller('inscriptions')
export class GeneratePdfDetailsInscriptionRoute {
  public constructor(
    private readonly generatePdfDetailsInscriptionUsecase: GeneratePdfDetailsInscriptionUsecase,
  ) {}

  @Get(':id/details/pdf')
  public async handle(
    @Param() params: GeneratePdfDetailsInscriptionRequest,
  ): Promise<GeneratePdfDetailsInscriptionResponse> {
    const input: GeneratePdfDetailsInscriptionInput = {
      inscriptionId: params.id,
    };

    const response =
      await this.generatePdfDetailsInscriptionUsecase.execute(input);
    return GeneratePdfDetailsInscriptionPresenter.toHttp(response);
  }
}
