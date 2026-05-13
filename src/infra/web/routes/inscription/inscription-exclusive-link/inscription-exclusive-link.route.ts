import { Body, Controller, Post } from '@nestjs/common';
import {
  InscriptionExclusiveLinkInput,
  InscriptionExclusiveLinkUsecase,
} from 'src/usecases/web/inscription/inscription-exclusive-link/inscription-exclusive-link.usecase';
import {
  InscriptionExclusiveLinkBody,
  InscriptionExclusiveLinkResponse,
} from './inscription-exclusive-link.dto';
import { InscriptionExclusiveLinkPresenter } from './inscription-exclusive-link.presenter';

@Controller('inscription/exclusive')
export class InscriptionExclusiveLinkRoute {
  constructor(
    private readonly inscriptionExclusiveLinkUsecase: InscriptionExclusiveLinkUsecase,
  ) {}

  @Post('register')
  async handle(
    @Body() body: InscriptionExclusiveLinkBody,
  ): Promise<InscriptionExclusiveLinkResponse> {
    const input: InscriptionExclusiveLinkInput = {
      eventId: body.eventId,
      exclusiveInscriptionLink: body.exclusiveInscriptionLink,
      guestName: body.name,
      guestEmail: body.email,
      cpf: body.cpf,
      gender: body.gender,
      phone: body.phone,
      guestLocality: body.guestLocality,
      birthDate: body.birthDate,
      observation: body.observation,
      typeInscriptionId: body.typeInscriptionId,
    };

    const response = await this.inscriptionExclusiveLinkUsecase.execute(input);
    return InscriptionExclusiveLinkPresenter.toHttp(response);
  }
}
