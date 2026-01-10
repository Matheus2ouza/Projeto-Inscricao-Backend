import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  RegisterIndivInscriptionUsecase,
  RegisterIndivInscriptionUsecaseInput,
} from 'src/usecases/web/inscription/indiv/register/register-indiv-inscription.usecase';
import type {
  RegisterIndivInscriptionUsecaseRequest,
  RegisterIndivInscriptionUsecaseResponse,
} from './register-indiv-inscription.dto';
import { RegisterIndivInscriptionPresenter } from './register-indiv-inscription.presenter';

@Controller('inscription/indiv')
export class RegisterIndivInscriptionRoute {
  constructor(
    private readonly registerIndivInscriptionUsecase: RegisterIndivInscriptionUsecase,
  ) {}

  @Post('register')
  async handle(
    @Body() body: RegisterIndivInscriptionUsecaseRequest,
    @UserId() userId: string,
  ): Promise<RegisterIndivInscriptionUsecaseResponse> {
    const input: RegisterIndivInscriptionUsecaseInput = {
      accountId: userId,
      eventId: body.eventId,
      responsible: body.responsible,
      email: body.email,
      phone: body.phone,
      member: body.member,
    };

    const response = await this.registerIndivInscriptionUsecase.execute(input);
    return RegisterIndivInscriptionPresenter.toHttp(response);
  }
}
