import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateTicketInput,
  CreateTicketUsecase,
} from 'src/usecases/web/tickets/create/create-ticket.usecase';
import type {
  CreateTicketRequest,
  CreateTicketResponse,
} from './create-ticket.dto';
import { CreateTicketPresenter } from './create-ticket.presenter';

@Controller('ticket')
export class CreateTicketRoute {
  public constructor(
    private readonly createTicketUsecase: CreateTicketUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() request: CreateTicketRequest,
  ): Promise<CreateTicketResponse> {
    const input: CreateTicketInput = {
      eventId: request.eventId,
      name: request.name,
      description: request.description,
      quantity: request.quantity,
      price: request.price,
    };

    const response = await this.createTicketUsecase.execute(input);
    return CreateTicketPresenter.toHttp(response);
  }
}
