export type GeneratePdfSelectedInscriptionsRequest = {
  inscriptionIds: string[];
};

export type GeneratePdfSelectedInscriptionsResponse = {
  pdfBase64: string;
  filename: string;
};
