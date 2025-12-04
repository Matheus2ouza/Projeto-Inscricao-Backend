export type GeneratePdfParticipantsSelectedAccountsRequest = {
  eventId: string;
  accountsId: string[];
};

export type GeneratePdfParticipantsSelectedAccountsResponse = {
  pdfBase64: string;
  filename: string;
};
