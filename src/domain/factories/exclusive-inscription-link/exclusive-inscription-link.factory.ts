import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { ExclusiveInscriptionLinkValidator } from 'src/domain/validators/exclusive-inscription-link/exclusive-inscription-link.validator';

export class ExclusiveInscriptionLinkValidatorFactory {
  public static create(): Validator<ExclusiveInscriptionLink> {
    return ExclusiveInscriptionLinkValidator.create();
  }
}
