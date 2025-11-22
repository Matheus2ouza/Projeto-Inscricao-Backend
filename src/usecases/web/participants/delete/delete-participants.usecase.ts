import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';
import { InscriptionMinimumParticipantsUsecaseException } from '../../exceptions/participants/inscription-minimum-participants.usecase.exception';
import { InscriptionNotPendingStatusUsecaseException } from '../../exceptions/participants/inscription-not-pending-status.usecase.exception';
import { ParticipantNotFoundUsecaseException } from '../../exceptions/participants/participant-not-found.usecase.exception';

export type DeleteParticipantsInput = {
  participantId: string;
};

@Injectable()
export class DeleteParticipantsUsecase
  implements Usecase<DeleteParticipantsInput, void>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
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
      participant.getInscriptionId(),
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to delete participant ${input.participantId} that is not associated with inscription ${participant.getInscriptionId()}`,
        `Inscrição não encontrada`,
        DeleteParticipantsUsecase.name,
      );
    }

    if (inscription.getStatus() === 'PAID') {
      throw new InscriptionNotPendingStatusUsecaseException(
        `attempt to delete participant ${input.participantId} from inscription ${participant.getInscriptionId()} that is not pending`,
        `Não é possível excluir um participante de uma inscrição que já foi finalizada.`,
        DeleteParticipantsUsecase.name,
      );
    }

    const countParticipants =
      await this.participantGateway.countAllByInscriptionId(
        inscription.getId(),
      );

    if (countParticipants - 1 < 1) {
      throw new InscriptionMinimumParticipantsUsecaseException(
        `attempt to delete participant ${input.participantId} from inscription ${participant.getInscriptionId()} but inscription must have at least one participant`,
        `Não é possível excluir o único participante. A inscrição deve ter pelo menos um participante.`,
        DeleteParticipantsUsecase.name,
      );
    }

    const typeInscription = await this.typeInscriptionGateway.findById(
      participant.getTypeInscriptionId(),
    );

    await this.participantGateway.delete(input.participantId);
    await this.eventGateway.decrementQuantityParticipants(
      inscription.getEventId(),
      1,
    );
    await this.inscriptionGateway.decrementValue(
      inscription.getId(),
      typeInscription?.getValue() || 0,
    );
  }
}
