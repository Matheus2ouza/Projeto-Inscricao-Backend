import { Locality } from 'src/domain/entities/locality/locality.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { LocalityZodValidator } from 'src/domain/validators/locality/locality.zod.validator';

export class LocalityValidatorFactory {
  public static create(): Validator<Locality> {
    return LocalityZodValidator.create();
  }
}
