import { Controller, Get, Param } from '@nestjs/common';
import {
  GeneratePdfInscriptionInput,
  GeneratePdfInscriptionUsecase,
} from 'src/usecases/web/inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.usecase';
import { GeneratePdfInscriptionResponse } from './generate-pdf-inscription.dto';
import { GeneratePdfInscriptionPresenter } from './generate-pdf-inscription.presenter';

@Controller('inscriptions')
export class GeneratePdfInscriptionRoute {
  public constructor(
    private readonly generatePdfInscriptionUsecase: GeneratePdfInscriptionUsecase,
  ) {}

  @Get(':id/pdf')
  async handle(
    @Param('id') id: string,
  ): Promise<GeneratePdfInscriptionResponse> {
    const input: GeneratePdfInscriptionInput = {
      inscriptionId: id,
    };

    const response = await this.generatePdfInscriptionUsecase.execute(input);
    return GeneratePdfInscriptionPresenter.toHttp(response);
  }
}
