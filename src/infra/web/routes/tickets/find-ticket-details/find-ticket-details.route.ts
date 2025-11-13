import { Controller, Get, Param } from '@nestjs/common';
import { FindTicketDetailsUsecase } from 'src/usecases/web/tickets/find-ticket-details/find-ticket-details.usecase';
import type {
  FindTicketDetailsRequest,
  FindTicketDetailsResponse,
} from './find-ticket-details.dto';
import { FindTicketDetailsPresenter } from './find-ticket-details.presenter';

@Controller('ticket')
export class FindTicketDetailsRoute {
  public constructor(
    private readonly findTicketDetailsUsecase: FindTicketDetailsUsecase,
  ) {}

  @Get(':eventTicketId/details')
  async handle(
    @Param() param: FindTicketDetailsRequest,
  ): Promise<FindTicketDetailsResponse> {
    const eventTicketId = param.eventTicketId;
    const response = await this.findTicketDetailsUsecase.execute({
      eventTicketId,
    });

    return FindTicketDetailsPresenter.toHttp(response);
  }
}
