export interface PaymentReceiptUpdateEmailData {
  paymentId: string;
  imageUrl: string;
  eventName: string;
}

export interface EventResponsibleEmailData {
  id: string;
  username: string;
  email?: string;
}

export interface PaymentReceiptUpdateEmailTemplateData
  extends Record<string, unknown> {
  paymentData: PaymentReceiptUpdateEmailData;
  responsibles: EventResponsibleEmailData[];
  year?: number;
  currentDate?: Date | string;
}
