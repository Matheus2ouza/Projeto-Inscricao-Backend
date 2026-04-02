export type GeneratePdfDetailsGuestInscriptionRequest = {
  id: string;
};

export type GeneratePdfDetailsGuestInscriptionResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};
