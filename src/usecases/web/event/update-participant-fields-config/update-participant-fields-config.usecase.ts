import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type UpdateParticipantFieldsConfigInput = {
  eventId: string;
  participanteConfig: ParticipantFieldsConfig;
};

export type UpdateParticipantFieldsConfigOutput = {
  message: 'modified';
  participanteConfig: ParticipantFieldsConfig;
};

@Injectable()
export class UpdateParticipantFieldsConfigUsecase
  implements
    Usecase<
      UpdateParticipantFieldsConfigInput,
      UpdateParticipantFieldsConfigOutput
    >
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: UpdateParticipantFieldsConfigInput,
  ): Promise<UpdateParticipantFieldsConfigOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to update participant fields config for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        UpdateParticipantFieldsConfigUsecase.name,
      );
    }

    event.update({
      participantFieldsConfig: input.participanteConfig,
    });

    await this.eventGateway.update(event);

    const output: UpdateParticipantFieldsConfigOutput = {
      message: 'modified',
      participanteConfig: event.getParticipantFieldsConfig(),
    };
    return output;
  }
}
