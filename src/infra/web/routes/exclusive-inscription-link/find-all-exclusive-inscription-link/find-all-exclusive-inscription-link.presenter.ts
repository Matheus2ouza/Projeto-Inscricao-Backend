import { FindAllExclusiveInscriptionLinkOutput } from 'src/usecases/web/exclusive-inscription-link/find-all-exclusive-inscription-link/find-all-exclusive-inscription-link.usecase';
import { FindAllExclusiveInscriptionLinkResponse } from './find-all-exclusive-inscription-link.dto';

export class FindAllExclusiveInscriptionLinkPresenter {
  public static toHttp(
    output: FindAllExclusiveInscriptionLinkOutput,
  ): FindAllExclusiveInscriptionLinkResponse {
    return {
      event: output.event,
      exclusiveInscriptionLinks: output.exclusiveInscriptionLinks,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
