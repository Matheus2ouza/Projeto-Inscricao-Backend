import type { EventResponsibleEmailData } from '../../types/inscription/inscription-email.types';

export interface InscriptionPaymentData {
  inscriptionId: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  totalValue: number;
}

export interface PaymentReviewNotificationEmailData {
  paymentId: string;
  eventName: string;
  eventLocation?: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  paymentValue: number;
  paymentDate: Date;
  accountUsername?: string;
  inscriptions: InscriptionPaymentData[];
}

export interface PaymentReviewNotificationEmailTemplateData
  extends Record<string, unknown> {
  paymentData: PaymentReviewNotificationEmailData;
  responsibles: EventResponsibleEmailData[];
  year?: number;
  currentDate?: Date | string;
}
