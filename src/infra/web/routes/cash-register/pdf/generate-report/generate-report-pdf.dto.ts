export type GenerateReportPdfParams = {
  id: string;
};

export type GenerateReportPdfQuery = {
  listExpenseCategory: string;
  moviments: string;
  favorite: string;
};

export type GenerateReportPdfResponse = {
  pdfBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};
