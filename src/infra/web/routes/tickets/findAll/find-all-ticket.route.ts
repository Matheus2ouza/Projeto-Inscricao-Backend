import { Controller, Get, Param } from '@nestjs/common';
import {
  FindAllTicketInput,
  FindAllTicketsUsecase,
} from 'src/usecases/web/tickets/findAll/find-all-ticket.usecase';
import type {
  FindAllTicketRequest,
  FindAllTicketResponse,
} from './find-all-ticket.dto';
import { FindAllTicketsPresenter } from './find-all-ticket.presenter';

@Controller('tickets')
export class FindAllTicketRoute {
  public constructor(
    private readonly findAllTicketsUsecase: FindAllTicketsUsecase,
  ) {}

  @Get(':eventId')
  async handle(
    @Param() param: FindAllTicketRequest,
  ): Promise<FindAllTicketResponse> {
    const input: FindAllTicketInput = {
      eventId: param.eventId,
    };

    const response = await this.findAllTicketsUsecase.execute(input);
    return FindAllTicketsPresenter.toHttp(response);
  }
}
