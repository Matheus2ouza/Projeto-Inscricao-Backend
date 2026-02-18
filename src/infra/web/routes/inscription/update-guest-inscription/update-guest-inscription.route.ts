import { Body, Controller, Param, Put } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  UpdateGuestInscriptionInput,
  UpdateGuestInscriptionUsecase,
} from 'src/usecases/web/inscription/update-guest-inscription/update-guest-inscription.usecase';
import type {
  UpdateGuestInscriptionRequest,
  UpdateGuestInscriptionResponse,
} from './update-guest-inscription.dto';
import { UpdateGuestInscriptionPresenter } from './update-guest-inscription.presenter';

@Controller('inscriptions')
export class UpdateGuestInscriptionRoute {
  public constructor(
    private readonly updateGuestInscriptionUsecase: UpdateGuestInscriptionUsecase,
  ) {}

  @IsPublic()
  @Put(':id/guest')
  public async handle(
    @Param() param: UpdateGuestInscriptionRequest,
    @Body() body: UpdateGuestInscriptionRequest,
  ): Promise<UpdateGuestInscriptionResponse> {
    const input: UpdateGuestInscriptionInput = {
      id: param.id,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestLocality: body.guestLocality,
      phone: body.phone,
    };

    const response = await this.updateGuestInscriptionUsecase.execute(input);
    return UpdateGuestInscriptionPresenter.toHttp(response);
  }
}
