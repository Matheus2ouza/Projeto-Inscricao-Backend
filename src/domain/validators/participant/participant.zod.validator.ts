import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { Participant } from 'src/domain/entities/participant.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class ParticipantZodValidator implements Validator<Participant> {
  private constructor() {}

  public static create(): ParticipantZodValidator {
    return new ParticipantZodValidator();
  }

  public validate(input: Participant): void {
    try {
      this.getInscriptionZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating participant ${input.getId()}: ${messages}`,
          `${messages}`,
          ParticipantZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating inscription ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do participante`,
        ParticipantZodValidator.name,
      );
    }
  }

  private getInscriptionZodSchema() {
    const zodSchema = z.object({
      inscriptionId: z.uuid('Id da Inscrição é obrigatório'),
      typeInscriptionId: z.uuid('Id da Inscrição é obrigatório'),
      name: z.string().min(2, 'Nome do participante é obrigatório'),
      preferredName: z
        .string()
        .min(2, 'Nome preferido deve ter no mínimo 2 caracteres')
        .optional(),
      cpf: z
        .string()
        .optional()
        .refine(
          (cpf) => {
            if (!cpf) return true; // é opcional

            const cleaned = cpf.replace(/\D/g, '');

            if (cleaned.length !== 11) return false;
            if (/^(\d)\1+$/.test(cleaned)) return false; // ex: 111.111.111-11

            // 1º dígito verificador
            let sum = 0;
            for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
            let remainder = ((sum * 10) % 11) % 10;
            if (remainder !== parseInt(cleaned[9])) return false;

            // 2º dígito verificador
            sum = 0;
            for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
            remainder = ((sum * 10) % 11) % 10;
            if (remainder !== parseInt(cleaned[10])) return false;

            return true;
          },
          { message: 'CPF inválido' },
        ),
      birthDate: z.coerce
        .date({
          message: 'Data de nascimento é obrigatória',
        })
        .refine(
          (date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            return date <= today;
          },
          {
            message: 'Data de nascimento não pode ser posterior à data de hoje',
          },
        ),
      gender: z.enum([genderType.MASCULINO, genderType.FEMININO], {
        error: 'Gênero é obrigatório',
      }),
      shirtSize: z
        .enum(Object.values(ShirtSize) as [string, ...string[]], {
          error: 'Escolha um tamanho valido',
        })
        .optional(),
      shirtType: z
        .enum(Object.values(ShirtType) as [string, ...string[]], {
          error: 'Escolha um modelo valido',
        })
        .optional(),
    });

    return zodSchema;
  }
}
