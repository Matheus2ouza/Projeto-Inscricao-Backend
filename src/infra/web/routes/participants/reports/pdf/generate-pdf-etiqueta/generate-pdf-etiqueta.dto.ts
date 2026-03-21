export type GeneratePdfEtiquetaRequest = {
  eventId: string;
  accountsId: string[];
};

export type GeneratePdfEtiquetaResponse = {
  pdfBase64: string;
  filename: string;
};
