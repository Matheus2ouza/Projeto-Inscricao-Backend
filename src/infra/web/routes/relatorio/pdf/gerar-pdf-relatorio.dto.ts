export type GerarPdfRelatorioRequest = {
  eventId: string;
};

export type GerarPdfRelatorioResponse = {
  pdfBuffer: Buffer;
  filename: string;
};
