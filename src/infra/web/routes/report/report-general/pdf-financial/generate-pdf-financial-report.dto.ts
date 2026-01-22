export type GeneratePdfFinancialReportRequest = {
  eventId: string;
  details: boolean;
};

export type GeneratePdfFinancialReportResponse = {
  pdfBase64: string;
  filename: string;
};
