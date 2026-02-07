import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListGuestParticipantsInput,
  ListGuestParticipantsUsecase,
} from 'src/usecases/web/participants/list-guest-participants/list-guest-participants.usecase';
import type {
  ListGuestParticipantsRequest,
  ListGuestParticipantsResponse,
} from './list-guest-participants.dto';
import { ListGuestParticipantsPresenter } from './list-guest-participants.presenter';

@Controller('participants')
export class ListGuestParticipantsRoute {
  public constructor(
    private readonly listGuestParticipantsUsecase: ListGuestParticipantsUsecase,
  ) {}

  @Get(':eventId/guests')
  async handle(
    @Param() param: ListGuestParticipantsRequest,
    @Query() query: ListGuestParticipantsRequest,
  ): Promise<ListGuestParticipantsResponse> {
    const input: ListGuestParticipantsInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listGuestParticipantsUsecase.execute(input);
    return ListGuestParticipantsPresenter.toHttp(response);
  }
}
