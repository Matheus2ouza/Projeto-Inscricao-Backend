import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class ExclusiveInscriptionLinkTypeValidator
  implements Validator<ExclusiveInscriptionLinkType>
{
  public static create(): ExclusiveInscriptionLinkTypeValidator {
    return new ExclusiveInscriptionLinkTypeValidator();
  }

  public validate(input: ExclusiveInscriptionLinkType): void {
    try {
      this.getExclusiveInscriptionLinkTypeValidationSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating exclusive inscription link type ${input.getId()}: ${messages}`,
          `${messages}`,
          ExclusiveInscriptionLinkTypeValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating exclusive inscription link type ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do tipo do link de inscrição exclusivo`,
        ExclusiveInscriptionLinkTypeValidator.name,
      );
    }
  }

  private getExclusiveInscriptionLinkTypeValidationSchema() {
    return z.object({
      exclusiveLinkId: z.uuid(),
      typeInscriptionId: z.uuid(),
    });
  }
}
