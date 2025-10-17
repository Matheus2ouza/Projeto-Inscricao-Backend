import { OnSiteParticipant } from '../entities/on-site-participant.entity';

export abstract class OnSiteParticipantGateway {
  abstract create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant>;

  abstract createMany(participants: OnSiteParticipant[]): Promise<void>;
}
