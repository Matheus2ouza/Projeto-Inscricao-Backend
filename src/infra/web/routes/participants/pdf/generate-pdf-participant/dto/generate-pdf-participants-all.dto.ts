export type GeneratePdfAllParticipantsAllRequest = {
  eventId: string;
};

export type GeneratePdfAllParticipantsAllResponse = {
  pdfBase64: string;
  filename: string;
};
