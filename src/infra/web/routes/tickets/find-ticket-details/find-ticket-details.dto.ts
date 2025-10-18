export type FindTicketDetailsRequest = {
  eventTicketId: string;
};

export type FindTicketDetailsResponse = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  ticketSale: {
    id: string;
    quantity: number;
    totalValue: number;
  }[];
};
