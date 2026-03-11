import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';

export type GeneratePdfAllInscriptionsRequest = {
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

export type GeneratePdfAllInscriptionsResponse = {
  pdfBase64: string;
  filename: string;
};
