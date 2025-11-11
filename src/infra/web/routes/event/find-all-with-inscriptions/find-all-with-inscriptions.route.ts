import { Controller, Get, Query } from '@nestjs/common';
import {
  FindAllWithInscriptionsInput,
  FindAllWithInscriptionsUsecase,
} from 'src/usecases/event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import type {
  FindAllWithInscriptionsRequest,
  FindAllWithInscriptionsResponse,
} from './find-all-with-inscriptions.dto';
import { FindAllWithInscriptionsPresenter } from './find-all-with-inscriptions.presenter';

@Controller('events')
export class FindAllWithInscriptionsRoute {
  public constructor(
    private readonly findAllwithInscriptionUsecase: FindAllWithInscriptionsUsecase,
  ) {}

  @Get('/inscriptions')
  public async handle(
    @Query() query: FindAllWithInscriptionsRequest,
  ): Promise<FindAllWithInscriptionsResponse> {
    const input: FindAllWithInscriptionsInput = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllwithInscriptionUsecase.execute(input);
    return FindAllWithInscriptionsPresenter.toHttp(response);
  }
}
