import { Controller, Get, Param } from '@nestjs/common';
import {
  GeneratePdfDetailsGuestInscriptionUsecase,
  type GeneratePdfDetailsGuestInscriptionInput,
} from 'src/usecases/web/inscription/reports/pdf/generate-pdf-details-guest-inscription/generate-pdf-details-guest-inscription.usecase';
import type {
  GeneratePdfDetailsGuestInscriptionRequest,
  GeneratePdfDetailsGuestInscriptionResponse,
} from './generate-pdf-details-guest-inscription.dto';
import { GeneratePdfDetailsGuestInscriptionPresenter } from './generate-pdf-details-guest-inscription.presenter';

@Controller('inscriptions')
export class GeneratePdfDetailsGuestInscriptionRoute {
  public constructor(
    private readonly generatePdfDetailsGuestInscriptionUsecase: GeneratePdfDetailsGuestInscriptionUsecase,
  ) {}

  @Get(':id/details/pdf')
  public async handle(
    @Param() params: GeneratePdfDetailsGuestInscriptionRequest,
  ): Promise<GeneratePdfDetailsGuestInscriptionResponse> {
    const input: GeneratePdfDetailsGuestInscriptionInput = {
      inscriptionId: params.id,
    };

    const response =
      await this.generatePdfDetailsGuestInscriptionUsecase.execute(input);
    return GeneratePdfDetailsGuestInscriptionPresenter.toHttp(response);
  }
}
