export interface PaymentEmailData {
  paymentId: string;
  inscriptionId: string;
  eventId?: string;
  eventName?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  paymentValue: number;
  paymentDate: Date;
  rejectionReason?: string;
}

export interface PaymentEmailTemplateData {
  paymentData: PaymentEmailData;
}

export interface EventResponsibleEmailData {
  username: string;
  email: string;
}
