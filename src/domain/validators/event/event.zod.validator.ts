import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { Event } from 'src/domain/entities/event/event.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import z from 'zod';

export class EventZodValidator implements Validator<Event> {
  private constructor() {}

  public static create(): EventZodValidator {
    return new EventZodValidator();
  }

  public validate(input: Event): void {
    try {
      this.getInscriptionZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const userMessage = ZodUtils.formatZodError(error);
        const logMessage = ZodUtils.formatZodErrorForLog(error, input);

        throw new ValidatorDomainException(
          `Error while validating event ${input.getId()}: ${logMessage}`,
          `${userMessage}`,
          EventZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating event ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados da inscrição`,
        EventZodValidator.name,
      );
    }
  }

  private getInscriptionZodSchema() {
    const zodSchema = z.object({
      name: z
        .string({ error: 'O nome do evento é obrigatório' })
        .min(2, { error: 'O nome do evento é muito curto' })
        .max(80, { error: 'O nome do evento é muito longo' }),
      startDate: z.date({ error: 'A data de incio do evento é obrigatório' }),
      endDate: z.date({ error: 'A data de fim do evento é obrigatório' }),
      quantityParticipants: z.number().nonnegative(),
      amountCollected: z.number().nonnegative(),
      amountNetValueCollected: z.number().nonnegative(),
      amountSpent: z.number().nonnegative(),
      regionId: z.uuid({ error: 'O evento tem que ser referente a ' }),
      imageUrl: z
        .string()
        .refine((i) => i.startsWith('events') && i.endsWith('.webp'), {
          error: 'Formato da imagem é inválida',
        })
        .optional(),
      location: z
        .string({ error: 'A localização do evento é obrigatório' })
        .min(2, { error: 'A localização do é muito curto' })
        .max(80, { error: 'A localização do é muito longo' })
        .optional(),
      longitude: z
        .number()
        .min(-180, { error: 'Longitude inválida' })
        .max(180, { error: 'Longitude inválida' })
        .optional(),
      latitude: z
        .number()
        .min(-90, { error: 'Latitude inválida' })
        .max(90, { error: 'Latitude inválida' })
        .optional(),
      status: z
        .enum([statusEvent.OPEN, statusEvent.CLOSE, statusEvent.FINALIZED], {
          error: 'Status do evento invalido',
        })
        .optional(),
      allowedInscriptionModes: z
        .array(
          z.enum(InscriptionMode, {
            error: 'Métodos de inscrição aceitos pelo evento invalido',
          }),
        )
        .min(1, { error: 'Selecione ao menos um método de inscrição' }),
      allowedPaymentModes: z
        .array(
          z.enum(PaymentMode, {
            error: 'Métodos de pagamentos aceitos pelo evento invalido',
          }),
        )
        .min(1, { error: 'Selecione ao menos um método de pagamento' }),
      paymentEnabled: z.boolean(),
      ticketEnabled: z.boolean().optional(),
    });

    return zodSchema;
  }
}
