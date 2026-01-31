import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  FindDetailsGuestInscriptionInput,
  FindDetailsGuestInscriptionUsecase,
} from 'src/usecases/web/inscription/find-details-gues-inscription/find-details-gues-inscription';
import type {
  FindDetailsGuestInscriptionRequest,
  FindDetailsGuestInscriptionResponse,
} from './find-details-gues-inscription.dto';
import { FindDetailsGuestInscriptionPresenter } from './find-details-gues-inscription.presenter';

@Controller('inscription')
export class FindDetailsGuestInscriptionRoute {
  constructor(
    private readonly findDetailsGuestInscriptionUseCase: FindDetailsGuestInscriptionUsecase,
  ) {}

  @IsPublic()
  @Get('guest/:confirmationCode/details')
  async handle(
    @Param() param: FindDetailsGuestInscriptionRequest,
  ): Promise<FindDetailsGuestInscriptionResponse> {
    const input: FindDetailsGuestInscriptionInput = {
      confirmationCode: param.confirmationCode,
    };

    const response =
      await this.findDetailsGuestInscriptionUseCase.execute(input);
    return FindDetailsGuestInscriptionPresenter.toHttp(response);
  }
}
