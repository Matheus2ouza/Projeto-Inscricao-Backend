import { UploadValidateIndivOutput } from 'src/usecases/inscription/indiv/upload-valide-indiv.usecase';
import { IndivUploadRouteResponse } from './indiv-upload.dto';

export class IndivUploadPresenter {
  public static toHttp(
    input: UploadValidateIndivOutput,
  ): IndivUploadRouteResponse {
    const response: IndivUploadRouteResponse = {
      cacheKey: input.cacheKey,
      participant: input.participant,
    };

    return response;
  }
}
