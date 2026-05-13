import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { ExclusiveInscriptionLinkTypeValidator } from 'src/domain/validators/exclusive-inscription-link-type/exclusive-inscription-link-type.validator';

export class ExclusiveInscriptionLinkTypeValidatorFactory {
  public static create(): Validator<ExclusiveInscriptionLinkType> {
    return ExclusiveInscriptionLinkTypeValidator.create();
  }
}
