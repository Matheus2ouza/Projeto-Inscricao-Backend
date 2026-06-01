import { Logger } from '@nestjs/common';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncOnSiteParticipantInput = {
  onSiteParticipant: OnSiteParticipant;
};

export type ReceiveSyncOnSiteParticipantOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncOnSiteParticipantUsecase
  implements
    Usecase<
      ReceiveSyncOnSiteParticipantInput,
      ReceiveSyncOnSiteParticipantOutput
    >
{
  private readonly logger = new Logger(
    ReceiveSyncOnSiteParticipantUsecase.name,
  );
  constructor(
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
  ) {}

  async execute(
    input: ReceiveSyncOnSiteParticipantInput,
  ): Promise<ReceiveSyncOnSiteParticipantOutput> {
    const onSiteParticipant = input.onSiteParticipant;

    this.logger.log('Validando se o participante já existe no banco');
    const existingOnSiteParticipant =
      await this.onSiteParticipantGateway.findById(onSiteParticipant.getId());

    this.logger.log(
      `Participante ${onSiteParticipant.getId()} ${existingOnSiteParticipant ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.onSiteParticipantGateway.upsert(onSiteParticipant);

    this.logger.log(`Participante sincronizado: ${onSiteParticipant.getId()}`);
    const output: ReceiveSyncOnSiteParticipantOutput = {
      id: onSiteParticipant.getId(),
      operation: existingOnSiteParticipant ? 'updated' : 'created',
    };

    return output;
  }
}
