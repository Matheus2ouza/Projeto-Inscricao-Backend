import { FindCacheOutput } from 'src/usecases/web/inscription/find-cache/find-cache.usecase';
import { FindCacheResponse } from './find-cache.dto';

export class FindCachePresenter {
  public static toHttp(output: FindCacheOutput): FindCacheResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
