export type SaleTicketRequest = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  totalValue: number;
  quantity: number;
};

export type SaleTicketResponse = {
  id: string;
  ticketQuantity: number;
  ticketPdfBase64: string;
};
