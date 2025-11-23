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
    @Body() body: CreateTicketRequest,
  ): Promise<CreateTicketResponse> {
    const input: CreateTicketInput = {
      eventId: body.eventId,
      name: body.name,
      description: body.description,
      quantity: body.quantity,
      price: body.price,
      expirationDate: body.expirationDate,
      isActive: body.isActive,
    };

    const response = await this.createTicketUsecase.execute(input);
    return CreateTicketPresenter.toHttp(response);
  }
}
