import { Locality } from "../entities/locality.entity";
import { Validator } from "../shared/validators/validator";
import { LocalityZodValidator } from "../validators/locality.zod.validator";

export class LocalityValidatorFactory {
  public static create(): Validator<Locality> {
    return LocalityZodValidator.create();
  }
}