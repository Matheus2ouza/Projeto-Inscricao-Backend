import { Controller, Get, Query } from '@nestjs/common';
import { FindAllPaginatedUsersUsecase } from 'src/usecases/user/find-all-paginated/find-all-paginated.usecase';
import { FindAllPaginatedUsersPresenter } from './find-all-paginated-users.presenter';
import type {
  FindAllPaginatedUsersRequest,
  FindAllPaginatedUsersResponse,
} from './find-all-paginated-users.dto';

@Controller('users')
export class FindAllPaginatedUsersRoute {
  public constructor(
    private readonly findAllPaginatedUsersUsecase: FindAllPaginatedUsersUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindAllPaginatedUsersRequest,
  ): Promise<FindAllPaginatedUsersResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedUsersUsecase.execute({
      page,
      pageSize,
    });

    return FindAllPaginatedUsersPresenter.toHttp(result);
  }
}
