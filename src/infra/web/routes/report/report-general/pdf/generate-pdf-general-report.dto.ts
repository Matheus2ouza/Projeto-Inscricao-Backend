export type GeneratePdfGeneralReportRequest = {
  eventId: string;
};

export type GeneratePdfGeneralReportResponse = {
  pdfBuffer: Buffer;
  filename: string;
};
