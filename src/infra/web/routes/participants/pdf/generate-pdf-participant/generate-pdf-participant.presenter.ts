import { GeneratePdfSelectedParticipantOutput } from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participant.usecase';
import { GeneratePdfSelectedParticipantResponse } from './generate-pdf-participant.dto';

export class GeneratePdfSelectedParticipantPresenter {
  public static toHttp(
    output: GeneratePdfSelectedParticipantOutput,
  ): GeneratePdfSelectedParticipantResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
