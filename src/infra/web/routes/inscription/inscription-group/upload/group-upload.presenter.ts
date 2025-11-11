import { GroupUploadOutput } from 'src/usecases/inscription/group/upload/group-upload.usecase';
import { GroupUploadRouteResponse } from './group-upload.dto';

export class GroupUploadPresenter {
  public static toHttp(input: GroupUploadOutput): GroupUploadRouteResponse {
    const unitValue = input.items.length > 0 ? input.items[0].value : 0;

    const response: GroupUploadRouteResponse = {
      cacheKey: input.cacheKey,
      total: input.total,
      unitValue,
      items: input.items,
    };
    return response;
  }
}
