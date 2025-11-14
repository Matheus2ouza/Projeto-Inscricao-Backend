import type { EventResponsibleEmailData } from '../../types/inscription/inscription-email.types';

export interface PaymentReviewNotificationEmailData {
  paymentId: string;
  inscriptionId: string;
  eventName: string;
  eventLocation?: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  paymentValue: number;
  paymentDate: Date;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  accountUsername?: string;
}

export interface PaymentReviewNotificationEmailTemplateData
  extends Record<string, unknown> {
  paymentData: PaymentReviewNotificationEmailData;
  responsibles: EventResponsibleEmailData[];
  year?: number;
  currentDate?: Date | string;
}
