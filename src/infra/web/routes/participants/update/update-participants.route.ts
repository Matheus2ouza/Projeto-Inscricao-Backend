import { UpdateParticipantsInput } from 'src/usecases/web/participants/update/update-participants.usecase';

import { Body, Controller, Param, Put } from '@nestjs/common';
import { UpdateParticipantsUsecase } from 'src/usecases/web/participants/update/update-participants.usecase';
import type {
  UpdateParticipantsRequest,
  UpdateParticipantsResponse,
} from './update-participants.dto';
import { UpdateParticipantsPresenter } from './update-participants.presenter';

@Controller('participants')
export class UpdateParticipantsRoute {
  public constructor(
    private readonly updateParticipantsUsecase: UpdateParticipantsUsecase,
  ) {}

  @Put(':id/update')
  public async handle(
    @Param('id') participantId: string,
    @Body() request: UpdateParticipantsRequest,
  ): Promise<UpdateParticipantsResponse> {
    const input: UpdateParticipantsInput = {
      participantId: participantId,
      name: request.name,
      birthDate: request.birthDate,
      gender: request.gender,
      typeInscriptionId: request.typeInscriptionId,
    };

    const response = await this.updateParticipantsUsecase.execute(input);
    return UpdateParticipantsPresenter.toHttp(response);
  }
}
