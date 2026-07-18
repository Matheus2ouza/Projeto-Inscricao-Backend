import { PaymentMethod } from 'generated/prisma';

export interface PaymentProcessedNotificationEmailData {
  paymentId: string;
  name: string;
  value: number;
  email: string;
  createdAt: Date;
  paymentMethod: PaymentMethod;
}

export interface PaymentProcessedNotificationEmailTemplateData
  extends Record<string, unknown> {
  eventName: string;
  paymentData: PaymentProcessedNotificationEmailData;
  year?: number;
  actionUrl?: string;
}
