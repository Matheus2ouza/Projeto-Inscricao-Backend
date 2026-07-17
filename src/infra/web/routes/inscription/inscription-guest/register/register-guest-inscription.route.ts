import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterGuestInscriptionInput,
  RegisterGuestInscriptionUsecase,
} from 'src/usecases/web/inscription/guest/register/register-guest-inscription.usecase';
import type {
  RegisterGuestInscriptionBody,
  RegisterGuestInscriptionParam,
  RegisterGuestInscriptionResponse,
} from './register-guest-inscription.dto';
import { RegisterGuestInscriptionPresenter } from './register-guest-inscription.presenter';

@Controller('inscription/guest')
export class RegisterGuestInscriptionRoute {
  constructor(
    private readonly registerGuestInscriptionUsecase: RegisterGuestInscriptionUsecase,
  ) {}

  @IsPublic()
  @Post(':eventId/register')
  async handle(
    @Param() param: RegisterGuestInscriptionParam,
    @Body() body: RegisterGuestInscriptionBody,
  ): Promise<RegisterGuestInscriptionResponse> {
    const input: RegisterGuestInscriptionInput = {
      eventId: param.eventId,
      localityId: body.localityId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      birthDate: body.birthDate,
      cpf: body.cpf,
      gender: body.gender,
      preferredName: body.preferredName,
      shirtSize: body.shirtSize,
      shirtType: body.shirtType,
      typeInscriptionId: body.typeInscriptionId,
    };

    const response = await this.registerGuestInscriptionUsecase.execute(input);
    return RegisterGuestInscriptionPresenter.toHtpp(response);
  }
}
