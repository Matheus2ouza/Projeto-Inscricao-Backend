import { Body, Controller, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterGuestInscriptionInput,
  RegisterGuestInscriptionUsecase,
} from 'src/usecases/web/inscription/guest/register/register-guest-inscription.usecase';
import type {
  RegisterGuestInscriptionBody,
  RegisterGuestInscriptionResponse,
} from './register-guest-inscription.dto';
import { RegisterGuestInscriptionPresenter } from './register-guest-inscription.presenter';

@Controller('inscription/guest')
export class RegisterGuestInscriptionRoute {
  constructor(
    private readonly registerGuestInscriptionUsecase: RegisterGuestInscriptionUsecase,
  ) {}

  @IsPublic()
  @Post('register')
  async handle(
    @Body() body: RegisterGuestInscriptionBody,
  ): Promise<RegisterGuestInscriptionResponse> {
    const input: RegisterGuestInscriptionInput = {
      eventId: body.eventId,
      guestEmail: body.email,
      guestName: body.name,
      preferredName: body.preferredName,
      cpf: body.cpf,
      gender: body.gender,
      phone: body.phone,
      guestLocality: body.locality,
      birthDate: body.birthDate,
      shirtSize: body.shirtSize,
      shirtType: body.shirtType,
      typeInscriptionId: body.typeInscriptionId,
    };

    const response = await this.registerGuestInscriptionUsecase.execute(input);
    return RegisterGuestInscriptionPresenter.toHtpp(response);
  }
}
