export type GeneratePdfLocalityParam = {
  eventId: string;
};

export type GeneratePdfLocalityQuery = {
  separate?: boolean | string;
  reduced?: boolean | string;
  summary?: boolean | string;
  typeInscriptions?: string | string[];
  columns?: ReportColumn[] | string | string[];
};

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'gender'
  | 'shirtSize'
  | 'shirtType'
  | 'typeInscription';

export type GeneratePdfLocalityResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};
