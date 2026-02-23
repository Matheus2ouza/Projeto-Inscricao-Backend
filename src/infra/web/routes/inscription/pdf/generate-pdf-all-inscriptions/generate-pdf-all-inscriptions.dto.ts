export type GeneratePdfAllInscriptionsRequest = {
  eventId: string;
  isGuest?: boolean;
  details: string;
  participants: string;
};

export type GeneratePdfAllInscriptionsResponse = {
  pdfBase64: string;
  filename: string;
};
