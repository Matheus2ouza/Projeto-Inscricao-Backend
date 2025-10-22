export type GeneratePdfGeneralReportRequest = {
  eventId: string;
};

export type GeneratePdfGeneralReportResponse = {
  pdfBase64: string;
  filename: string;
};
