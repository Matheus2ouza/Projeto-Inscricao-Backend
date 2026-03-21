export type GeneratePdfLocalityParam = {
  eventId: string;
};

export type GeneratePdfLocalityQuery = {
  separate?: boolean | string;
  reduced?: boolean | string;
};

export type GeneratePdfLocalityResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};
