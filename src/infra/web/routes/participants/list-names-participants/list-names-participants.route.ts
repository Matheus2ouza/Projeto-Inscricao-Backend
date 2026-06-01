import { Controller, Get, Param } from '@nestjs/common';
import {
  ListNamesParticipantsInput,
  ListNamesParticipantsUsecase,
} from 'src/usecases/web/participants/list-names-participants/list-names-participants.usecase';
import {
  ListNamesParticipantsParams,
  ListNamesParticipantsResponse,
} from './list-names-participants.dto';
import { ListNamesParticipantsPresenter } from './list-names-participants.presenter';

@Controller('participants')
export class ListNamesParticipantsRoute {
  constructor(
    private readonly listNamesParticipantsUsecase: ListNamesParticipantsUsecase,
  ) {}

  @Get(':eventId/names')
  async handle(
    @Param() param: ListNamesParticipantsParams,
  ): Promise<ListNamesParticipantsResponse> {
    const input: ListNamesParticipantsInput = {
      eventId: param.eventId,
    };

    const response = await this.listNamesParticipantsUsecase.execute(input);

    return ListNamesParticipantsPresenter.toHttp(response);
  }
}
