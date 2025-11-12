import { CreateRegionOutput } from 'src/usecases/web/region/create/create-region.usecase';
import { CreateRegionResponse } from './create-region.dto';

export class CreateRegionPresenter {
  public static toHttp(input: CreateRegionOutput): CreateRegionResponse {
    const response: CreateRegionResponse = {
      id: input.id,
    };
    return response;
  }
}
