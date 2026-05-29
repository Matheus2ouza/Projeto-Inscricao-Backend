import { Injectable, Logger } from '@nestjs/common';
import { Participant } from 'src/domain/entities/participant.entity';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncParticipantInput = {
  participant: Participant;
};

export type ReceiveSyncParticipantOutput = {
  id: string;
  operation: 'created' | 'updated';
};

@Injectable()
export class ReceiveSyncParticipantUsecase
  implements Usecase<ReceiveSyncParticipantInput, ReceiveSyncParticipantOutput>
{
  private readonly logger = new Logger(ReceiveSyncParticipantUsecase.name);
  constructor(private readonly participantGateway: ParticipantGateway) {}

  async execute(
    input: ReceiveSyncParticipantInput,
  ): Promise<ReceiveSyncParticipantOutput> {
    const participantInput = input.participant;

    this.logger.log('Verificando se o participante já existe no banco');
    const existingParticipant = await this.participantGateway.findById(
      participantInput.getId(),
    );

    this.logger.log(
      `Participante ${participantInput.getId()} ${existingParticipant ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    const participant = await this.participantGateway.upsert(participantInput);

    this.logger.log(`Participante sincronizado: ${participant.getId()}`);

    const output: ReceiveSyncParticipantOutput = {
      id: participant.getId(),
      operation: existingParticipant ? 'updated' : 'created',
    };

    return output;
  }
}
