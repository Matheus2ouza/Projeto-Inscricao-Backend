import { Controller, Get, Param } from '@nestjs/common';
import { FindAllTicketsUsecase } from 'src/usecases/tickets/findAll/find-all-ticket.usecase';
import type {
  FindAllTicketRequest,
  FindAllTicketResponse,
} from './find-all-ticket.dto';
import { FindAllTicketsPresenter } from './find-all-ticket.presenter';

@Controller('ticket')
export class FindAllTicketRoute {
  public constructor(
    private readonly findAllTicketsUsecase: FindAllTicketsUsecase,
  ) {}

  @Get(':eventId')
  async handle(
    @Param() param: FindAllTicketRequest,
  ): Promise<FindAllTicketResponse> {
    const eventId = param.eventId;

    const response = await this.findAllTicketsUsecase.execute({ eventId });

    return FindAllTicketsPresenter.toHttp(response);
  }
}
