export type GeneratePdfSelectedParticipantRequest = {
  accountIds: string[];
};

export type GeneratePdfSelectedParticipantResponse = {
  pdfBase64: string;
  filename: string;
};
