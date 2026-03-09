import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';

export type GeneratePdfAllInscriptionsRequest = {
  eventId: string;

  // filtros
  participants?: string;
  payment?: string;
  status?: InscriptionStatus | InscriptionStatus[];
  statusPayment?: StatusPayment | StatusPayment[];
  methodPayment?: PaymentMethod | PaymentMethod[];
  isGuest?: string;
  limitTime?: string;
};

export type GeneratePdfAllInscriptionsResponse = {
  pdfBase64: string;
  filename: string;
};
