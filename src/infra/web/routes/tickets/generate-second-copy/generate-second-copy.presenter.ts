import type { GenerateTicketPdfSecondCopyOutput } from 'src/usecases/web/tickets/generate-ticket-pdf-second-copy/generate-ticket-pdf-second-copy.usecase';
import type { GenerateTicketPdfSecondCopyResponse } from './generate-second-copy.dto';

export class GenerateTicketPdfSecondCopyPresenter {
  public static toHttp(
    output: GenerateTicketPdfSecondCopyOutput,
  ): GenerateTicketPdfSecondCopyResponse {
    return {
      filename: output.filename,
      pdfBase64: output.pdfBase64,
    };
  }
}
