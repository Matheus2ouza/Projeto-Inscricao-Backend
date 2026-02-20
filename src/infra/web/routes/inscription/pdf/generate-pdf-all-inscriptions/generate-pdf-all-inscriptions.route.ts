import { GeneratePdfAllInscriptionsUsecase } from 'src/usecases/web/inscription/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';

export class GeneratePdfAllInscriptionsRoute {
  constructor(
    private readonly generatePdfAllInscriptionsUsecase: GeneratePdfAllInscriptionsUsecase,
  ) {}
}
