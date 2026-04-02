export type GenerateXlsxLocalityParam = {
  eventId: string;
};

export type GenerateXlsxLocalityQuery = {
  separate?: boolean | string;
};

export type GenerateXlsxLocalityResponse = {
  fileBase64: string;
  filename: string;
  contentType:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip';
};
