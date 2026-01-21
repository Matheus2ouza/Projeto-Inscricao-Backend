import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListParticipantsInput,
  ListParticipantsUsecase,
} from 'src/usecases/web/participants/list-participants/list-participants.usecase';
import type {
  ListParticipantsRequest,
  ListParticipantsResponse,
} from './list-participants.dto';
import { ListParticipantsPresenter } from './list-participants.presenter';

@Controller('participants')
export class ListParticipantsRoute {
  public constructor(
    private readonly listParticipantsUsecase: ListParticipantsUsecase,
  ) {}

  @Get(':eventId')
  async handle(
    @Param() param: ListParticipantsRequest,
    @Query() query: ListParticipantsRequest,
  ): Promise<ListParticipantsResponse> {
    const input: ListParticipantsInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listParticipantsUsecase.execute(input);
    return ListParticipantsPresenter.toHttp(response);
  }
}
