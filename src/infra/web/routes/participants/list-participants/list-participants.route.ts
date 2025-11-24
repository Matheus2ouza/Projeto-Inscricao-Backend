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

  @Get(':id')
  async handle(
    @Param('id') eventId: string,
    @Query() query: ListParticipantsRequest,
  ): Promise<ListParticipantsResponse> {
    const input: ListParticipantsInput = {
      eventId: eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listParticipantsUsecase.execute(input);
    return ListParticipantsPresenter.toHttp(response);
  }
}
