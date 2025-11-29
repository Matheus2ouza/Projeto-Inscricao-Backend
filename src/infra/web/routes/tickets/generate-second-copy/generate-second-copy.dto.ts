export type GenerateTicketPdfSecondCopyRequest = {
  ticketSaleId: string;
};

export type GenerateTicketPdfSecondCopyResponse = {
  filename: string;
  pdfBase64: string;
};
