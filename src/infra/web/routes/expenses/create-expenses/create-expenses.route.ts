import { Body, Controller, Post } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  CreateExpensesInput,
  CreateExpensesUsecase,
} from 'src/usecases/web/expenses/create-expenses/create-expenses.usecase';
import type {
  CreateExpensesBody,
  CreateExpensesResponse,
} from './create-expenses.dto';
import { CreateExpensesPresenter } from './create-expenses.presenter';

@Controller('expenses')
export class CreateExpensesRoute {
  public constructor(
    private readonly createExpensesUsecase: CreateExpensesUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() body: CreateExpensesBody,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<CreateExpensesResponse> {
    const input: CreateExpensesInput = {
      accountId: userInfo.userId,
      eventId: body.eventId,
      description: body.description,
      value: body.value,
      paymentMethod: body.paymentMethod,
      responsible: body.responsible,
      category: body.category,
      images: body.images,
      createAt: body.createAt,
    };

    const response = await this.createExpensesUsecase.execute(input);

    return CreateExpensesPresenter.toHttp(response);
  }
}
