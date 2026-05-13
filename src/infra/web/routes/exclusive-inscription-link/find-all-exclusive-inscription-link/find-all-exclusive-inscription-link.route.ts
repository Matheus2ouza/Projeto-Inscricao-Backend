import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FindAllExclusiveInscriptionLinkInput,
  FindAllExclusiveInscriptionLinkUsecase,
} from 'src/usecases/web/exclusive-inscription-link/find-all-exclusive-inscription-link/find-all-exclusive-inscription-link.usecase';
import {
  FindAllExclusiveInscriptionLinkParam,
  FindAllExclusiveInscriptionLinkQuery,
  FindAllExclusiveInscriptionLinkResponse,
} from './find-all-exclusive-inscription-link.dto';
import { FindAllExclusiveInscriptionLinkPresenter } from './find-all-exclusive-inscription-link.presenter';

@Controller('exclusive-inscription')
export class FindAllExclusiveInscriptionLinkRoute {
  constructor(
    private readonly findAllExclusiveInscriptionLinkUsecase: FindAllExclusiveInscriptionLinkUsecase,
  ) {}

  @Get('find-all/:eventId')
  async handle(
    @Param() param: FindAllExclusiveInscriptionLinkParam,
    @Query() query: FindAllExclusiveInscriptionLinkQuery,
  ): Promise<FindAllExclusiveInscriptionLinkResponse> {
    const input: FindAllExclusiveInscriptionLinkInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response =
      await this.findAllExclusiveInscriptionLinkUsecase.execute(input);

    return FindAllExclusiveInscriptionLinkPresenter.toHttp(response);
  }
}
