import { Body, Controller, Post } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  CreateExpensesInput,
  CreateExpensesUsecase,
} from 'src/usecases/web/event-expenses/create/create-event-expenses.usecase';
import type {
  CreateExpensesRequest,
  CreateExpensesResponse,
} from './create-expenses.dto';
import { CreateExpensesPresenter } from './create-expenses.presenter';

@Controller('event-expenses')
export class CreateExpensesRoute {
  public constructor(
    private readonly createExpensesUsecase: CreateExpensesUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() request: CreateExpensesRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<CreateExpensesResponse> {
    const input: CreateExpensesInput = {
      accountId: userInfo.userId,
      eventId: request.eventId,
      description: request.description,
      value: request.value,
      paymentMethod: request.paymentMethod,
      responsible: request.responsible,
    };

    const response = await this.createExpensesUsecase.execute(input);

    return CreateExpensesPresenter.toHttp(response);
  }
}
