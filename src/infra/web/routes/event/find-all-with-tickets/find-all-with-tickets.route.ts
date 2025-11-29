import { Controller, Get, Query } from '@nestjs/common';
import {
  FindAllWithTicketsInput,
  FindAllWithTicketsUsecase,
} from 'src/usecases/web/event/find-all-with-tickets/find-all-with-tickets.usecase';
import type {
  FindAllWithTicketsRequest,
  FindAllWithTicketsResponse,
} from './find-all-with-tickets.dto';
import { FindAllWithTicketsPresenter } from './find-all-with-tickets.presenter';

@Controller('events')
export class FindAllWithTicketsRoute {
  public constructor(
    private readonly findAllWithTicketsUsecase: FindAllWithTicketsUsecase,
  ) {}

  @Get('/tickets')
  async handle(
    @Query() query: FindAllWithTicketsRequest,
  ): Promise<FindAllWithTicketsResponse> {
    const input: FindAllWithTicketsInput = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllWithTicketsUsecase.execute(input);
    return FindAllWithTicketsPresenter.toHttp(response);
  }
}
