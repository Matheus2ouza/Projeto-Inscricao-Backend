import { Body, Controller, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterGuestInscriptionInput,
  RegisterGuestInscriptionUsecase,
} from 'src/usecases/web/inscription/guest/register/register-guest-inscription.usecase';
import type {
  RegisterGuestInscriptionRequest,
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
    @Body() body: RegisterGuestInscriptionRequest,
  ): Promise<RegisterGuestInscriptionResponse> {
    const input: RegisterGuestInscriptionInput = {
      eventId: body.eventId,
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      guestLocality: body.guestLocality,
      phone: body.phone,
      participant: body.participant,
    };

    const response = await this.registerGuestInscriptionUsecase.execute(input);
    return RegisterGuestInscriptionPresenter.toHtpp(response);
  }
}
