import { Controller, Get, Param } from '@nestjs/common';
import { FindDetailsEventUsecase } from 'src/usecases/event/find-details/find-details-event.usecase';
import {
  FindDetailsEventRequest,
  FindDetailsEventResponse,
} from './find-details-event.dto';
import { FindDetailsEventPresenter } from './find-details-event.presenter';

@Controller('events')
export class FindDetailsEventRoute {
  public constructor(
    private readonly findDetailsEventUsecase: FindDetailsEventUsecase,
  ) {}

  @Get(':id/details')
  public async handle(
    @Param('id') id: string,
  ): Promise<FindDetailsEventResponse> {
    const input: FindDetailsEventRequest = {
      eventId: id,
    };
    const response = await this.findDetailsEventUsecase.execute(input);
    return FindDetailsEventPresenter.toHttp(response);
  }
}
