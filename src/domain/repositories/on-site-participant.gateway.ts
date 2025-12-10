import { OnSiteParticipant } from '../entities/on-site-participant.entity';

export abstract class OnSiteParticipantGateway {
  abstract create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant>;

  abstract createMany(participants: OnSiteParticipant[]): Promise<void>;
  abstract findManyByOnSiteRegistrationId(
    OnSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]>;
  abstract countByOnSiteRegistrationId(
    OnSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]>;

  abstract countParticipantsByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<number>;
}
