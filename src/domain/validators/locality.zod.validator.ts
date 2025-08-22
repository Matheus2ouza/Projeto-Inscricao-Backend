import { z } from "zod";
import { Locality } from "../entities/locality.entity";
import { Validator } from "../shared/validators/validator";
import { ZodUtils } from "src/shared/utils/zod-utils";
import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { DomainException } from "../shared/exceptions/domain.exception";

export class LocalityZodValidator implements Validator<Locality> {
  private constructor() {}

  public static create(): LocalityZodValidator {
    return new LocalityZodValidator();
  }

  public validate(input: Locality): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if( error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating locality ${input.getId()}: ${message}`,
          `Dados para criação de usuário inválidos: ${message}`,
          LocalityZodValidator.name
        )
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating locality ${input.getId()}: ${err.message}`,
        `Error inesperado ao validar os dados do usuário`,
        LocalityZodValidator.name
      )
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.uuid(),
      locality: z.string().min(2),
      password: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });
    return zodSchema
  }
}