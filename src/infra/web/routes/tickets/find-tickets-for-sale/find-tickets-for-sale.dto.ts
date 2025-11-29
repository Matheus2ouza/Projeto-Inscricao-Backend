export type FindTicketsForSaleRequest = {
  eventId: string;
};

export type FindTicketsForSaleResponse = {
  id: string;
  name: string;
  imageUrl?: string;
  ticketEnabled?: boolean;
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
  isActive: boolean;
}[];
