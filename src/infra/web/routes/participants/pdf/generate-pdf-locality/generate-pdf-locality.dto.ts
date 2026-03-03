export type GeneratePdfLocalityRequest = {
  eventId: string;
};

export type GeneratePdfLocalityResponse = {
  pdfBase64: string;
  filename: string;
};
