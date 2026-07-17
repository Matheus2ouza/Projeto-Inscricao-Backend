import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

export type UpdateParticipantFieldsConfigParam = {
  id: string;
};

export type UpdateParticipantFieldsConfigBody = {
  participanteConfig: ParticipantFieldsConfig;
};

export type UpdateParticipantFieldsConfigResponse = {
  message: 'modified';
  participanteConfig: ParticipantFieldsConfig;
};
