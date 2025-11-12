import { FindAllPaginatedUsersOutput } from 'src/usecases/web/user/find-all-paginated/find-all-paginated.usecase';
import { FindAllPaginatedUsersResponse } from './find-all-paginated-users.dto';

export class FindAllPaginatedUsersPresenter {
  public static toHttp(
    input: FindAllPaginatedUsersOutput,
  ): FindAllPaginatedUsersResponse {
    return {
      users: input.users,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
