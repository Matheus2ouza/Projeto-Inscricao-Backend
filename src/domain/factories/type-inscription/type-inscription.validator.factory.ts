import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { TypeInscriptionZodValidator } from 'src/domain/validators/type-inscription/type-inscription.zod.validator';

export class TypeInscriptionValidatorFactory {
  public static create(): Validator<TypeInscription> {
    return TypeInscriptionZodValidator.create();
  }
}
