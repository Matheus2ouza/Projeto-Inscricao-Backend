export type FindAllTicketRequest = {
  eventId: string;
};

export type FindAllTicketResponse = {
  id: string;
  name: string;
  imageUrl?: string;
  quantityTicketSale: number;
  totalSalesValue: number;
  tickets: Tickets;
};

type Tickets = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  expirationDate: Date;
  available: number;
}[];
