import { FindAllPaginatedMembersOutput } from 'src/usecases/web/members/find-all-paginated/find-all-paginated-members.usecase';
import { FindAllPaginatedMembersResponse } from './find-all-paginated-members.dto';

export class FindAllPaginatedMembersPresenter {
  public static toHttp(
    output: FindAllPaginatedMembersOutput,
  ): FindAllPaginatedMembersResponse {
    return {
      members: output.members,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
