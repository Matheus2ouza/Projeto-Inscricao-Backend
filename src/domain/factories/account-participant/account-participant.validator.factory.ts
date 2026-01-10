import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { AccountParticipantZodValidator } from 'src/domain/validators/account-participant/account-participant.zod.validator';

export class AccountParticipantValidatorFactory {
  public static create(): Validator<AccountParticipant> {
    return AccountParticipantZodValidator.create();
  }
}
