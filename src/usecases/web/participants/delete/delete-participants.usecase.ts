import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';
import { InscriptionNotPendingStatusUsecaseException } from '../../exceptions/participants/inscription-not-pending-status.usecase.exception';
import { ParticipantNotFoundUsecaseException } from '../../exceptions/participants/participant-not-found.usecase.exception';

export type DeleteParticipantsInput = {
  inscriptionId: string;
  participantId: string;
};

@Injectable()
export class DeleteParticipantsUsecase
  implements Usecase<DeleteParticipantsInput, void>
{
  constructor(
    private readonly participantGateway: ParticipantGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  public async execute(input: DeleteParticipantsInput): Promise<void> {
    const participant = await this.participantGateway.findById(
      input.participantId,
    );

    if (!participant) {
      throw new ParticipantNotFoundUsecaseException(
        `attempt to delete participant ${input.participantId} that does not exist`,
        `Participante não encontrado`,
        DeleteParticipantsUsecase.name,
      );
    }

    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to delete participant ${input.participantId} that is not associated with inscription ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        DeleteParticipantsUsecase.name,
      );
    }

    if (inscription.getStatus() !== 'PENDING') {
      throw new InscriptionNotPendingStatusUsecaseException(
        `attempt to delete participant ${input.participantId} from inscription ${input.inscriptionId} that is not pending`,
        `Não é possível excluir um participante de uma inscrição que já foi finalizada.`,
        DeleteParticipantsUsecase.name,
      );
    }

    await this.participantGateway.delete(input.participantId);
    await this.eventGateway.decrementQuantityParticipants(
      inscription.getEventId(),
      1,
    );
  }
}
