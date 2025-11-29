import { Controller, Get, Param } from '@nestjs/common';
import {
  FindTicketDetailsInput,
  FindTicketDetailsUsecase,
} from 'src/usecases/web/tickets/find-ticket-details/find-ticket-details.usecase';
import type {
  FindTicketDetailsRequest,
  FindTicketDetailsResponse,
} from './find-ticket-details.dto';
import { FindTicketDetailsPresenter } from './find-ticket-details.presenter';

@Controller('tickets')
export class FindTicketDetailsRoute {
  public constructor(
    private readonly findTicketDetailsUsecase: FindTicketDetailsUsecase,
  ) {}

  @Get(':eventTicketId/details')
  async handle(
    @Param() param: FindTicketDetailsRequest,
  ): Promise<FindTicketDetailsResponse> {
    const input: FindTicketDetailsInput = {
      eventTicketId: param.eventTicketId,
    };

    const response = await this.findTicketDetailsUsecase.execute(input);

    return FindTicketDetailsPresenter.toHttp(response);
  }
}
