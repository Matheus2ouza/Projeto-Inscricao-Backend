import { IndivUploadValidateOutput } from 'src/usecases/web/inscription/indiv/upload/indiv-upload-valide.usecase';
import { IndivUploadRouteResponse } from './indiv-upload.dto';

export class IndivUploadPresenter {
  public static toHttp(
    input: IndivUploadValidateOutput,
  ): IndivUploadRouteResponse {
    const response: IndivUploadRouteResponse = {
      cacheKey: input.cacheKey,
      participant: input.participant,
    };

    return response;
  }
}
