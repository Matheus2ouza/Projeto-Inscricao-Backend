import { UpdateParticipantsInput } from 'src/usecases/web/participants/update/update-participants.usecase';

import { Body, Controller, Param, Put } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { UpdateParticipantsUsecase } from 'src/usecases/web/participants/update/update-participants.usecase';
import type {
  UpdateParticipantsBody,
  UpdateParticipantsParam,
  UpdateParticipantsResponse,
} from './update-participants.dto';
import { UpdateParticipantsPresenter } from './update-participants.presenter';

@Controller('participants')
export class UpdateParticipantsRoute {
  public constructor(
    private readonly updateParticipantsUsecase: UpdateParticipantsUsecase,
  ) {}

  @IsPublic()
  @Put(':id')
  public async handle(
    @Param() param: UpdateParticipantsParam,
    @Body() body: UpdateParticipantsBody,
  ): Promise<UpdateParticipantsResponse> {
    const input: UpdateParticipantsInput = {
      id: param.id,
      name: body.name,
      cpf: body.cpf,
      birthDate: body.birthDate,
      gender: body.gender,
      preferredName: body.preferredName,
      shirtSize: body.shirtSize,
      shirtType: body.shirtType,
    };

    const response = await this.updateParticipantsUsecase.execute(input);
    return UpdateParticipantsPresenter.toHttp(response);
  }
}
