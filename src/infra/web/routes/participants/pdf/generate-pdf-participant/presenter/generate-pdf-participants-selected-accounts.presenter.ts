import { GeneratePdfParticipantsSelectedAccountsOutput } from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participants-selected-accounts.usecase';
import { GeneratePdfParticipantsSelectedAccountsResponse } from '../dto/generate-pdf-participants-selected-accounts.dto';

export class GeneratePdfParticipantsSelectedAccountsPresenter {
  public static toHttp(
    response: GeneratePdfParticipantsSelectedAccountsOutput,
  ): GeneratePdfParticipantsSelectedAccountsResponse {
    return {
      pdfBase64: response.pdfBase64,
      filename: response.filename,
    };
  }
}
