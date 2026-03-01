import { Participant } from 'src/domain/entities/participant.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { ParticipantZodValidator } from 'src/domain/validators/participant/participant.zod.validator';

export class ParticipantValidatorFactory {
  public static create(): Validator<Participant> {
    return ParticipantZodValidator.create();
  }
}
