import type { EventResponsibleEmailData } from '../../types/inscription/inscription-email.types';

export interface TicketSaleNotificationEmailData {
  saleId: string;
  paymentId: string;
  eventName: string;
  eventLocation?: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  totalValue: number;
  paymentMethod: string;
  paymentValue: number;
  submittedAt: Date;
}

export interface TicketSaleNotificationEmailTemplateData
  extends Record<string, unknown> {
  saleData: TicketSaleNotificationEmailData;
  responsibles: EventResponsibleEmailData[];
  year?: number;
  currentDate?: Date | string;
}
