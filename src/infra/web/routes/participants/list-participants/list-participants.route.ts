import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListParticipantsInput,
  ListParticipantsUsecase,
} from 'src/usecases/web/participants/list-participants/list-participants.usecase';
import type {
  ListParticipantsParams,
  ListParticipantsQuery,
  ListParticipantsResponse,
} from './list-participants.dto';
import { ListParticipantsPresenter } from './list-participants.presenter';

@Controller('participants')
export class ListParticipantsRoute {
  public constructor(
    private readonly listGuestParticipantsUsecase: ListParticipantsUsecase,
  ) {}

  @Get(':eventId')
  async handle(
    @Param() param: ListParticipantsParams,
    @Query() query: ListParticipantsQuery,
  ): Promise<ListParticipantsResponse> {
    const input: ListParticipantsInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,

      // filters
      inscriptionStatus: query.inscriptionStatus,
      typeInscriptions: query.typeInscriptions,
      orderByName: query.orderByName,
    };

    console.log(input);

    const response = await this.listGuestParticipantsUsecase.execute(input);
    return ListParticipantsPresenter.toHttp(response);
  }
}
