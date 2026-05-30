import { GeneratePdfRoomOutput } from 'src/usecases/web/participants/reports/pdf/generate-pdf-room/generate-pdf-room.usecase';
import { GeneratePdfRoomResponse } from './generate-pdf-room.dto';

export class GeneratePdfRoomPresenter {
  public static toHttp(output: GeneratePdfRoomOutput): GeneratePdfRoomResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
