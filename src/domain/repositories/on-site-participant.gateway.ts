import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { OnSiteParticipant } from '../entities/on-site-participant.entity';

export abstract class OnSiteParticipantGateway {
  abstract create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant>;

  abstract createTx(
    onSiteParticipant: OnSiteParticipant,
    tx: PrismaTransactionClient,
  ): Promise<OnSiteParticipant>;

  abstract createMany(participants: OnSiteParticipant[]): Promise<number>;

  abstract createManyTx(
    participants: OnSiteParticipant[],
    tx: PrismaTransactionClient,
  ): Promise<number>;

  abstract upsert(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant>;

  abstract updateManyTx(
    onSiteParticipant: OnSiteParticipant[],
    tx: PrismaTransactionClient,
  ): Promise<number>;

  abstract findById(id: string): Promise<OnSiteParticipant | null>;

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
