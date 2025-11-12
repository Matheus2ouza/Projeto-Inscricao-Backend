import { Controller, Get, Param } from '@nestjs/common';
import { FindTypeInscriptionByEventIdUsecase } from 'src/usecases/web/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.usecase';
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

  @Get('event/:eventId')
  public async handle(
    @Param() query: FindTypeInscriptionByEventIdRequest,
  ): Promise<FindTypeInscriptionByEventIdResponse> {
    const eventId = String(query.eventId);

    const result = await this.findTypeInscriptionByEventIdUsecase.execute({
      eventId: eventId,
    });

    const response = FindTypeInscriptionByEventIdPresenter.toHttp(result);
    return response;
  }
}
