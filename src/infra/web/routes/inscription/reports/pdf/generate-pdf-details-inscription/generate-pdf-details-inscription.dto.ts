export type GeneratePdfDetailsInscriptionRequest = {
  id: string;
};

export type GeneratePdfDetailsInscriptionResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};
