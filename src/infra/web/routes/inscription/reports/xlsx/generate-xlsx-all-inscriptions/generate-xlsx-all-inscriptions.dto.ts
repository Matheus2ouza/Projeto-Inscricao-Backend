import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';

export type GenerateXlsxAllInscriptionsParms = {
  eventId: string;
};

export type GenerateXlsxAllInscriptionsQuery = {
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

export type GenerateXlsxAllInscriptionsResponse = {
  fileBase64: string;
  filename: string;
  contentType:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip';
};
