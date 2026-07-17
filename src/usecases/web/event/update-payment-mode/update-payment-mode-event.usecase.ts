import { Injectable } from '@nestjs/common';
import { isArray } from 'class-validator';
import { PaymentMode } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { PaymentModeNotValidUsecaseException } from '../../exceptions/events/payment-mode-not-valid.usecase.exception';

export type UpdatePaymentModeEventInput = {
  eventId: string;
  paymentMode: PaymentMode[];
};

export type UpdatePaymentModeEventOutput = {
  message: 'modified';
  paymentMode: PaymentMode[];
};

@Injectable()
export class UpdatePaymentModeEventUsecase
  implements Usecase<UpdatePaymentModeEventInput, UpdatePaymentModeEventOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: UpdatePaymentModeEventInput,
  ): Promise<UpdatePaymentModeEventOutput> {
    const validModes = Object.values(PaymentMode);

    if (
      !isArray(input.paymentMode) ||
      input.paymentMode.some((mode) => !validModes.includes(mode))
    ) {
      throw new PaymentModeNotValidUsecaseException(
        'Tentativa de atualizar o inscriptionMode com valores inválidos.',
        'Não foi possível atualizar os modos de inscrição do evento.',
        UpdatePaymentModeEventUsecase.name,
      );
    }
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Tentativa de atualizar o inscriptionMode do evento mas foi passado um id do evento invalido: ${input.eventId}`,
        `Evento não encontrado para atualizar os modos de inscrição`,
        UpdatePaymentModeEventUsecase.name,
      );
    }

    event.setAllowedPaymentModes(input.paymentMode);
    await this.eventGateway.update(event);

    const output: UpdatePaymentModeEventOutput = {
      message: 'modified',
      paymentMode: event.getAllowedPaymentModes(),
    };

    return output;
  }
}
