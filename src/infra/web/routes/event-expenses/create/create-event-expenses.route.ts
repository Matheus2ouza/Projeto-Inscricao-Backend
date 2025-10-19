import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  CreateEventExpensesInput,
  CreateEventExpensesUsecase,
} from 'src/usecases/event-expenses/create/create-event-expenses.usecase';
import type {
  CreateEventExpensesRequest,
  CreateEventExpensesResponse,
} from './create-event-expenses.dto';
import { CreateEventExpensesPresenter } from './create-event-expenses.presenter';

@Controller('event-expenses')
export class CreateEventExpensesRoute {
  public constructor(
    private readonly createEventExpensesUsecase: CreateEventExpensesUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() request: CreateEventExpensesRequest,
    @UserId() accountId: string,
  ): Promise<CreateEventExpensesResponse> {
    const input: CreateEventExpensesInput = {
      accountId: accountId,
      eventId: request.eventId,
      description: request.description,
      value: request.value,
      paymentMethod: request.paymentMethod,
      responsible: request.responsible,
    };

    const response = await this.createEventExpensesUsecase.execute(input);

    return CreateEventExpensesPresenter.toHttp(response);
  }
}
