import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

export function getMissingRequiredFields(
  config: ParticipantFieldsConfig,
  data: Partial<Record<keyof ParticipantFieldsConfig, unknown>>,
): string[] {
  return Object.entries(config)
    .filter(([, rule]) => rule === 'required')
    .filter(
      ([field]) =>
        data[field as keyof ParticipantFieldsConfig] === undefined ||
        data[field as keyof ParticipantFieldsConfig] === null ||
        data[field as keyof ParticipantFieldsConfig] === '',
    )
    .map(([field]) => field);
}
