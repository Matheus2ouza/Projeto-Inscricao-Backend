import { Inscription } from 'src/domain/entities/inscription.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { InscriptionZodValidator } from 'src/domain/validators/inscription/inscription.zod.validator';

export class InscriptionValidatorFactory {
  public static create(): Validator<Inscription> {
    return InscriptionZodValidator.create();
  }
}
