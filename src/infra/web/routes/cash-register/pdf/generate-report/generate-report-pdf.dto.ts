export type GenerateReportPdfRequest = {
  id: string;
};

export type GenerateReportPdfResponse = {
  pdfBase64: string;
  filename: string;
};
