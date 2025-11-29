import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalInscriptionsUserInput = {
  accountId: string;
  regionId: string;
};

export type FindTotalInscriptionsUserOutput = {
  countTotalInscriptions: number;
  countTotalParticipants: number;
  countPendingInscriptions: number;
};

@Injectable()
export class FindTotalInscriptionsUserUsecase
  implements
    Usecase<FindTotalInscriptionsUserInput, FindTotalInscriptionsUserOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  public async execute(
    input: FindTotalInscriptionsUserInput,
  ): Promise<FindTotalInscriptionsUserOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        countTotalInscriptions: 0,
        countTotalParticipants: 0,
        countPendingInscriptions: 0,
      };
    }

    const [totalInscriptions, totalParticipants, pendingCount] =
      await Promise.all([
        this.inscriptionGateway.countTotalInscriptions(
          event.getId(),
          input.accountId,
        ),
        this.participantGateway.countByAccountIdAndEventId(
          input.accountId,
          event.getId(),
        ),
        this.inscriptionGateway.countPendingInscriptions(
          event.getId(),
          input.accountId,
        ),
      ]);

    const output: FindTotalInscriptionsUserOutput = {
      countTotalInscriptions: totalInscriptions,
      countTotalParticipants: totalParticipants,
      countPendingInscriptions: pendingCount,
    };
    return output;
  }
}
