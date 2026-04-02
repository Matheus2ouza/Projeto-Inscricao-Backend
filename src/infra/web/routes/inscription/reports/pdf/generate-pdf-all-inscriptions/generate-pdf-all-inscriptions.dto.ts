import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';

export type GenerateAllInscriptionsRequest = {
  eventId: string;

  // filtros
  participants?: string | boolean;
  payment?: string | boolean;
  status?: InscriptionStatus | InscriptionStatus[];
  statusPayment?: StatusPayment | StatusPayment[];
  methodPayment?: PaymentMethod | PaymentMethod[];
  isGuest?: string | boolean;
  startDate?: string;
  endDate?: string;
};

export type GenerateAllInscriptionsResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};
