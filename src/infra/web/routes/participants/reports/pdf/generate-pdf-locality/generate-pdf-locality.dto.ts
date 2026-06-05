import { InscriptionStatus } from 'generated/prisma';

export type GeneratePdfLocalityParam = {
  eventId: string;
};

export type GeneratePdfLocalityQuery = {
  separate?: boolean | string;
  reduced?: boolean | string;
  summary?: boolean | string;

  // filtros
  typeInscriptions?: string | string[];
  columns?: ReportColumn[] | string | string[];
  inscriptionsStatus?: InscriptionStatus | InscriptionStatus[];
  startDate?: string;
  endDate?: string;
};

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'phone'
  | 'gender'
  | 'shirtSize'
  | 'shirtType'
  | 'typeInscription';

export type GeneratePdfLocalityResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};
