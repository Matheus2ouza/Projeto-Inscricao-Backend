import { Injectable } from '@nestjs/common';
import { isArray } from 'class-validator';
import { InscriptionMode } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InscriptionModeNotValidUsecaseException } from '../../exceptions/events/inscription-mode-not-valid.usecase.exception';

export type UpdateInscriptionModeEventInput = {
  eventId: string;
  inscriptionMode: InscriptionMode[];
};

export type UpdateInscriptionModeEventOutput = {
  message: 'modified';
  inscriptionMode: InscriptionMode[];
};

@Injectable()
export class UpdateInscriptionModeEventUsecase
  implements
    Usecase<UpdateInscriptionModeEventInput, UpdateInscriptionModeEventOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: UpdateInscriptionModeEventInput,
  ): Promise<UpdateInscriptionModeEventOutput> {
    const validModes = Object.values(InscriptionMode);

    if (
      !isArray(input.inscriptionMode) ||
      input.inscriptionMode.some((mode) => !validModes.includes(mode))
    ) {
      throw new InscriptionModeNotValidUsecaseException(
        'Tentativa de atualizar o inscriptionMode com valores inválidos.',
        'Não foi possível atualizar os modos de inscrição do evento.',
        UpdateInscriptionModeEventUsecase.name,
      );
    }
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Tentativa de atualizar o inscriptionMode do evento mas foi passado um id do evento invalido: ${input.eventId}`,
        `Evento não encontrado para atualizar os modos de inscrição`,
        UpdateInscriptionModeEventUsecase.name,
      );
    }

    event.setAllowedInscriptionModes(input.inscriptionMode);
    await this.eventGateway.update(event);

    const output: UpdateInscriptionModeEventOutput = {
      message: 'modified',
      inscriptionMode: event.getAllowedInscriptionModes(),
    };

    return output;
  }
}
