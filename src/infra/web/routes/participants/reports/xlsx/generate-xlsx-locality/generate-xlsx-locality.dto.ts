export type GenerateXlsxLocalityParam = {
  eventId: string;
};

export type GenerateXlsxLocalityQuery = {
  separate?: boolean | string;
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

export type GenerateXlsxLocalityResponse = {
  fileBase64: string;
  filename: string;
  contentType:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip';
};
