import { UpdateParticipantsInput } from 'src/usecases/web/participants/update/update-participants.usecase';

import { Body, Controller, Param, Put } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
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

  @IsPublic()
  @Put(':id/update')
  public async handle(
    @Param() param: UpdateParticipantsRequest,
    @Body() request: UpdateParticipantsRequest,
  ): Promise<UpdateParticipantsResponse> {
    const input: UpdateParticipantsInput = {
      id: param.id,
      name: request.name,
      birthDate: request.birthDate,
      gender: request.gender,
      preferredName: request.preferredName,
      shirtSize: request.shirtSize,
      shirtType: request.shirtType,
    };

    const response = await this.updateParticipantsUsecase.execute(input);
    return UpdateParticipantsPresenter.toHttp(response);
  }
}
