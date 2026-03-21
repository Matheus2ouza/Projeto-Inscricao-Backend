export type GeneratePdfInscriptionRequest = {
  inscriptionId: string;
};

export type GeneratePdfInscriptionResponse = {
  pdfBase64: string;
  filename: string;
};
