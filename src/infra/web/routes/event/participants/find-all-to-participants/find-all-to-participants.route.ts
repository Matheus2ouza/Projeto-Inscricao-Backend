import { Controller, Get, Query } from '@nestjs/common';
import {
  FindAllToParticipantsInput,
  FindAllToParticipantsUsecase,
} from 'src/usecases/web/event/participants/find-all-to-participants/find-all-to-participants.usecase';
import type {
  FindAllToParticipantsRequest,
  FindAllToParticipantsResponse,
} from './find-all-to-participants.dto';
import { FindAllToParticipantsPresenter } from './find-all-to-participants.presenter';

@Controller('events')
export class FindAllToParticipantsRoute {
  public constructor(
    private readonly FindAllToParticipantsUsecase: FindAllToParticipantsUsecase,
  ) {}

  @Get('participants')
  async handle(
    @Query() query: FindAllToParticipantsRequest,
  ): Promise<FindAllToParticipantsResponse> {
    const input: FindAllToParticipantsInput = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.FindAllToParticipantsUsecase.execute(input);
    return FindAllToParticipantsPresenter.toHttp(response);
  }
}
