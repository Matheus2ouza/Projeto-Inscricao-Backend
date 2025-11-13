import { Controller, Get, Query } from '@nestjs/common';
import { FindAllPaginatedEventToInscriptionUsecase } from 'src/usecases/web/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import type {
  FindAllPaginatedEventToInscriptionRequest,
  FindAllPaginatedEventToInscriptionResponse,
} from './find-all-paginated-events-to-inscription.dto';
import { FindAllPaginatedEventToInscriptionPresenter } from './find-all-paginated-events-to-inscription.presenter';

@Controller('events')
export class FindAllPaginatedEventToInscriptionRoute {
  public constructor(
    private readonly findAllPaginatedEventToInscriptionUsecase: FindAllPaginatedEventToInscriptionUsecase,
  ) {}

  @Get('analysis/inscription')
  public async handle(
    @Query() query: FindAllPaginatedEventToInscriptionRequest,
  ): Promise<FindAllPaginatedEventToInscriptionResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedEventToInscriptionUsecase.execute(
      {
        page,
        pageSize,
      },
    );

    return FindAllPaginatedEventToInscriptionPresenter.toHttp(result);
  }
}
