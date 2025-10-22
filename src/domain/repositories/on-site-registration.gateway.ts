import { OnSiteParticipantPayment } from '../entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from '../entities/on-site-participant.entity';
import { OnSiteRegistration } from '../entities/on-site-registration.entity';

export type OnSiteRegistrationPaymentTotals = {
  totalDinheiro: number;
  totalCartao: number;
  totalPix: number;
  totalGeral: number;
};

export abstract class OnSiteRegistrationGateway {
  abstract create(
    onSiteRegistration: OnSiteRegistration,
  ): Promise<OnSiteRegistration>;

  abstract createWithParticipantsAndPayments(
    onSiteRegistration: OnSiteRegistration,
    participants: OnSiteParticipant[],
    payments: OnSiteParticipantPayment[],
  ): Promise<OnSiteRegistration>;

  abstract findMany(eventId: string): Promise<OnSiteRegistration[]>;

  abstract findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<OnSiteRegistration[]>;

  abstract countAll(eventId: string): Promise<number>;

  abstract sumPaymentsByMethod(
    eventId: string,
  ): Promise<OnSiteRegistrationPaymentTotals>;
}
