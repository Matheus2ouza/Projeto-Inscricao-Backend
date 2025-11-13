import { Controller, Get, Query } from '@nestjs/common';
import {
  FindAllPaginatedEventsInput,
  FindAllPaginatedEventsUsecase,
} from 'src/usecases/web/event/find-all-event/find-all-paginated-events.usecase';
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
    const status = Array.isArray(query.status)
      ? query.status
      : query.status
        ? [query.status]
        : [];

    const input: FindAllPaginatedEventsInput = {
      status,
      page,
      pageSize,
    };
    const result = await this.findAllPaginatedEventsUsecase.execute(input);

    return FindAllPaginatedEventsPresenter.toHttp(result);
  }
}
