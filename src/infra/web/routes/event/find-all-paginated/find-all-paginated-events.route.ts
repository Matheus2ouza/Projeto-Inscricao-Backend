import { Controller, Get, Query } from '@nestjs/common';
import { FindAllPaginatedEventsUsecase } from 'src/usecases/event/find-all-event/find-all-paginated-events.usecase';
import type {
  FindAllPaginatedEventResponse,
  FindAllPaginatedEventsRequest,
} from './find-all-paginated-events.dto';
import { FindAllPaginatedEventsPresenter } from './find-all-paginated-events.presenter';

@Controller('events')
export class FindAllPaginatedEventsRoute {
  public constructor(
    private readonly findAllPaginatedEventsUsecase: FindAllPaginatedEventsUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindAllPaginatedEventsRequest,
  ): Promise<FindAllPaginatedEventResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedEventsUsecase.execute({
      page,
      pageSize,
    });

    return FindAllPaginatedEventsPresenter.toHttp(result);
  }
}
