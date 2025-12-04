import { GeneratePdfParticipantsAllOutput } from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participants-all.usecase';
import { GeneratePdfAllParticipantsAllResponse } from '../dto/generate-pdf-participants-all.dto';

export class GeneratePdfParticipantsAllPresenter {
  public static toHttp(
    output: GeneratePdfParticipantsAllOutput,
  ): GeneratePdfAllParticipantsAllResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
