import { UpdateParticipantFieldsConfigOutput } from 'src/usecases/web/event/update-participant-fields-config/update-participant-fields-config.usecase';
import { UpdateParticipantFieldsConfigResponse } from './update-participant-fields-config.dto';

export class UpdateParticipantFieldsConfigPresenter {
  public static toHttp(
    output: UpdateParticipantFieldsConfigOutput,
  ): UpdateParticipantFieldsConfigResponse {
    return {
      message: output.message,
      participanteConfig: output.participanteConfig,
    };
  }
}
