import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  CreateNewRegisterInput,
  CreateNewRegisterUsecase,
} from 'src/usecases/web/cash-register/create-new-register/create-new-register.usecase';
import {
  CreateNewRegisterBody,
  CreateNewRegisterParam,
  CreateNewRegisterResponse,
} from './create-new-register.dto';
import { CreateNewRegisterPresenter } from './create-new-register.presenter';

@Controller('cash-register')
export class CreateNewRegisterRoute {
  constructor(
    private readonly createNewRegisterUsecase: CreateNewRegisterUsecase,
  ) {}

  @Post(':cashRegisterId/register')
  async handler(
    @Param() param: CreateNewRegisterParam,
    @Body() body: CreateNewRegisterBody,
  ): Promise<CreateNewRegisterResponse> {
    const input: CreateNewRegisterInput = {
      cashRegisterId: param.cashRegisterId,
      type: body.type,
      method: body.method,
      value: body.value,
      description: body.description,
      eventId: body.eventId,
      responsible: body.responsible,
      image: body.image,
    };

    const response = await this.createNewRegisterUsecase.execute(input);
    return CreateNewRegisterPresenter.toHttp(response);
  }
}
