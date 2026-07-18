import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateParticipantFieldsConfigInput,
  UpdateParticipantFieldsConfigUsecase,
} from 'src/usecases/web/event/update-participant-fields-config/update-participant-fields-config.usecase';
import {
  UpdateParticipantFieldsConfigBody,
  UpdateParticipantFieldsConfigParam,
  UpdateParticipantFieldsConfigResponse,
} from './update-participant-fields-config.dto';
import { UpdateParticipantFieldsConfigPresenter } from './update-participant-fields-config.presenter';

@Controller('events')
export class UpdateParticipantFieldsConfigRoute {
  public constructor(
    private readonly updateParticipantFieldsConfigUsecase: UpdateParticipantFieldsConfigUsecase,
  ) {}

  @Patch(':id/update/participant-fields')
  public async handle(
    @Param() param: UpdateParticipantFieldsConfigParam,
    @Body() body: UpdateParticipantFieldsConfigBody,
  ): Promise<UpdateParticipantFieldsConfigResponse> {
    const input: UpdateParticipantFieldsConfigInput = {
      eventId: param.id,
      participanteConfig: body.participanteConfig,
    };

    const response =
      await this.updateParticipantFieldsConfigUsecase.execute(input);
    return UpdateParticipantFieldsConfigPresenter.toHttp(response);
  }
}
