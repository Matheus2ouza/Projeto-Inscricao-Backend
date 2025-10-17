import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindAllPaginatedOnSiteRegistrationUsecase } from 'src/usecases/inscriptionAvul/findAll/find-all-paginated-onsite-registration.usecase';
import type {
  FindAllPaginatedOnSiteRegistrationRequest,
  FindAllPaginatedOnSiteRegistrationResponse,
} from './find-all-paginated-onsite-registration.dto';
import { FindAllPaginatedOnSiteRegistrationPresenter } from './find-all-paginated-onsite-registration.presenter';

@Controller('inscriptions/avul')
export class FindAllPaginatedOnSiteRegistrationRoute {
  public constructor(
    private readonly usecase: FindAllPaginatedOnSiteRegistrationUsecase,
  ) {}

  @Get(':eventId')
  public async handle(
    @Param('eventId') eventId: string,
    @Query() query: FindAllPaginatedOnSiteRegistrationRequest,
  ): Promise<FindAllPaginatedOnSiteRegistrationResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const data = {
      eventId: eventId,
      page,
      pageSize,
    };

    console.log(data);

    const result = await this.usecase.execute(data);
    return FindAllPaginatedOnSiteRegistrationPresenter.toHttp(result);
  }
}
