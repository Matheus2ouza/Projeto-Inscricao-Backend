import z from "zod";
import { Validator } from "../shared/validators/validator";
import { ZodUtils } from "src/shared/utils/zod-utils";
import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { LocalityZodValidator } from "./locality.zod.validator";
import { DomainException } from "../shared/exceptions/domain.exception";

export class LocalityPasswordZodValidator implements Validator<string> {
  private constructor() {};

  public static create(): LocalityPasswordZodValidator {
    return new LocalityPasswordZodValidator();
  }

  public validate(input: string): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if( error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating locality password: ${message}`,
          `Senha inválida`,
          LocalityPasswordZodValidator.name
        )
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating locality password: ${err.message}`,
        `Error inesperado ao validar a senha do usuário`,
        LocalityPasswordZodValidator.name
      )
    }
  }

  private getZodSchema() {
    const zodSchema = z.string().min(6);

    return zodSchema; 
  }
}