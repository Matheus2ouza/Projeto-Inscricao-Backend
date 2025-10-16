import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InvalidEventStatusUsecaseException } from '../../exceptions/events/invalid-event-status.usecase.exception';

export type UpdateInscriptionEventInput = {
  eventId: string;
  InscriptionStatus: string;
};

export type UpdateInscriptionEventOutput = {
  eventId: string;
  InscriptionStatus: string;
};

@Injectable()
export class UpdateInscriptionEventUsecase
  implements Usecase<UpdateInscriptionEventInput, UpdateInscriptionEventOutput>
{
  constructor(private readonly eventGateway: EventGateway) {}

  async execute(
    input: UpdateInscriptionEventInput,
  ): Promise<UpdateInscriptionEventOutput> {
    const isValidStatus = Object.values(statusEvent).includes(
      input.InscriptionStatus as statusEvent,
    );

    if (!isValidStatus) {
      throw new InvalidEventStatusUsecaseException(
        `update attempt or failure because the status was invalid: ${input.InscriptionStatus}`,
        `Status Invalido`,
        UpdateInscriptionEventUsecase.name,
      );
    }

    const event = await this.eventGateway.updateInscription(
      input.eventId,
      input.InscriptionStatus as statusEvent,
    );

    return {
      eventId: event.getId(),
      InscriptionStatus: event.getStatus(),
    };
  }
}
