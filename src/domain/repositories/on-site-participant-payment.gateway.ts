import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { OnSiteParticipantPayment } from '../entities/on-site-participant-payment.entity';

export abstract class OnSiteParticipantPaymentGateway {
  abstract create(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment>;

  abstract createManyTx(
    payment: OnSiteParticipantPayment[],
    tx: PrismaTransactionClient,
  ): Promise<number>;

  abstract upsert(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment>;

  abstract findById(id: string): Promise<OnSiteParticipantPayment | null>;
  abstract findManyByOnSiteParticipantsPayment(
    id: string,
  ): Promise<OnSiteParticipantPayment[]>;
  abstract findByParticipantId(
    participantId: string,
  ): Promise<OnSiteParticipantPayment[]>;
}
