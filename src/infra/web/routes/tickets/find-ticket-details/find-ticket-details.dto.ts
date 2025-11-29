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
  expirationDate: Date;
  isActive: boolean;
  TicketSaleItens: TicketSaleItem[];
};

export type TicketSaleItem = {
  id: string;
  quantity: number;
  createdAt: Date;
};
