import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  RegisterGroupInscriptionUsecase,
  RegisterGroupInscriptionUsecaseInput,
} from 'src/usecases/web/inscription/group/register/register-grup-inscription.usecase';
import type {
  RegisterGroupInscriptionUsecaseRequest,
  RegisterGroupInscriptionUsecaseResponse,
} from './register-grup-inscription.dto';
import { RegisterGroupInscriptionPresenter } from './register-grup-inscription.presenter';

@Controller('inscription/group')
export class RegisterGroupInscriptionRoute {
  constructor(
    private readonly registerGroupInscriptionUsecase: RegisterGroupInscriptionUsecase,
  ) {}

  @Post('register')
  async handle(
    @UserId() userId: string,
    @Body() body: RegisterGroupInscriptionUsecaseRequest,
  ): Promise<RegisterGroupInscriptionUsecaseResponse> {
    const input: RegisterGroupInscriptionUsecaseInput = {
      accountId: userId,
      eventId: body.eventId,
      responsible: body.responsible,
      phone: body.phone,
      members: body.members,
    };

    const response = await this.registerGroupInscriptionUsecase.execute(input);
    return RegisterGroupInscriptionPresenter.toHttp(response);
  }
}
