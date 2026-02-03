import { Controller, Get, Param } from '@nestjs/common';
import {
  FindTypeInscriptionByEventIdInput,
  FindTypeInscriptionByEventIdUsecase,
} from 'src/usecases/web/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.usecase';
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
    const input: FindTypeInscriptionByEventIdInput = {
      eventId: query.eventId,
    };

    const response =
      await this.findTypeInscriptionByEventIdUsecase.execute(input);
    return FindTypeInscriptionByEventIdPresenter.toHttp(response);
  }
}
