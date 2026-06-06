import { PaymentMethod } from 'generated/prisma';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class EventExpensesZodValidator implements Validator<EventExpenses> {
  private constructor() {}

  public static create(): EventExpensesZodValidator {
    return new EventExpensesZodValidator();
  }

  public validate(input: EventExpenses): void {
    try {
      this.getEventExpensesZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating expense ${input.getId()}: ${messages}`,
          `${messages}`,
          EventExpensesZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating expense ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do gasto`,
        EventExpensesZodValidator.name,
      );
    }
  }

  private getEventExpensesZodSchema() {
    const zodSchema = z.object({
      eventId: z.uuid({ error: 'O id do evento é obrigatório' }),
      description: z
        .string()
        .min(5, { error: 'Descrição muito curta' })
        .max(300, {
          error: 'Descrição muito longa, tamanho maximo: 300 caractere',
        }),
      value: z
        .number({ error: 'O valor do gasto é obrigatório' })
        .positive({ error: 'O valor valor minimo do gasto é R$:0,01' }),
      paymentMethod: z.enum(
        [PaymentMethod.CARTAO, PaymentMethod.DINHEIRO, PaymentMethod.PIX],
        { error: 'A escolha de como foi gasto é inválido' },
      ),
      responsible: z
        .string({
          error: 'O responsavel pelo gasto é obrigatório',
        })
        .min(2, { error: 'Nome do responsavel muito curto' })
        .max(100, { error: 'Nome do Responsavel muito longo' }),
    });

    return zodSchema;
  }
}
