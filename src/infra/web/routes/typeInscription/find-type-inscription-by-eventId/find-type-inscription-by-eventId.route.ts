import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindTypeInscriptionByEventIdUsecase } from 'src/usecases/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-id.usecase';
import type {
  FindTypeInscriptionByEventIdRequest,
  FindTypeInscriptionByEventIdResponse,
} from './find-type-inscription-by-eventId.dto';
import { FindTypeInscriptionByEventIdPresenter } from './find-type-inscription-by-eventId.presenter';

@Controller('type-inscription')
export class FindByEventId {
  public constructor(
    private readonly findTypeInscriptionByEventIdUsecase: FindTypeInscriptionByEventIdUsecase,
  ) {}

  @Get('event')
  public async handle(
    @Query() query: FindTypeInscriptionByEventIdRequest,
  ): Promise<FindTypeInscriptionByEventIdResponse> {
    const eventId = String(query.eventId);

    const result = await this.findTypeInscriptionByEventIdUsecase.execute({
      eventId,
    });

    const response = FindTypeInscriptionByEventIdPresenter.toHttp(result);
    return response;
  }
}
