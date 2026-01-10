import { z } from 'zod';
import { AccountParticipant } from '../../entities/account-participant.entity';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { ValidatorDomainException } from '../../shared/exceptions/validator-domain.exception';
import { Validator } from '../../shared/validators/validator';

export class AccountParticipantZodValidator
  implements Validator<AccountParticipant>
{
  private constructor() {}

  public static create(): AccountParticipantZodValidator {
    return new AccountParticipantZodValidator();
  }

  public validate(input: AccountParticipant): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating account participant ${input.getId()}: ${messages}`,
          `${messages}`,
          AccountParticipantZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating account participant ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do participante`,
        AccountParticipantZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.uuid({ message: 'ID deve ser um UUID válido' }),
      accountId: z.uuid({ message: 'accountId deve ser um UUID válido' }),
      name: z
        .string()
        .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
      birthDate: z.date({
        message: 'Data de nascimento deve ser uma data válida',
      }),
      gender: z.enum(['MASCULINO', 'FEMININO'], {
        message: 'Gênero deve ser MASCULINO ou FEMININO',
      }),
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    return zodSchema;
  }
}
