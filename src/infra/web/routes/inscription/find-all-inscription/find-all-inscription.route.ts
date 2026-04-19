import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindAllInscriptionsUsecase } from 'src/usecases/web/inscription/find-all-inscription/find-all-inscription.usecase';
import {
  FindAllInscriptionParam,
  FindAllInscriptionQuery,
  FindAllInscriptionResponse,
} from './find-all-inscription.dto';
import { FindAllInscriptionPresenter } from './find-all-inscription.presenter';

@Controller('inscriptions')
export class FindAllInscriptionRoute {
  constructor(
    private readonly findAllInscriptionsUsecase: FindAllInscriptionsUsecase,
  ) {}

  @Get(':eventId/list')
  async handler(
    @Param() param: FindAllInscriptionParam,
    @Query() query: FindAllInscriptionQuery,
  ): Promise<FindAllInscriptionResponse> {
    const input = {
      eventId: param.eventId,
      status: query.status,
      responsible: query.responsible,
    };

    const response = await this.findAllInscriptionsUsecase.execute(input);
    return FindAllInscriptionPresenter.toHttp(response);
  }
}
