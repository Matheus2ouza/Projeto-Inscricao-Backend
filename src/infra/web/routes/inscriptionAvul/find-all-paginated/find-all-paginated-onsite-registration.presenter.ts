import { FindAllPaginatedOnSiteRegistrationOutput } from 'src/usecases/inscriptionAvul/findAll/find-all-paginated-onsite-registration.usecase';
import { FindAllPaginatedOnSiteRegistrationResponse } from './find-all-paginated-onsite-registration.dto';

export class FindAllPaginatedOnSiteRegistrationPresenter {
  public static toHttp(
    input: FindAllPaginatedOnSiteRegistrationOutput,
  ): FindAllPaginatedOnSiteRegistrationResponse {
    return {
      registrations: input.registrations,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
      totals: input.totals,
    };
  }
}
