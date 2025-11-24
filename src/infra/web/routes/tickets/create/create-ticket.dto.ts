export type CreateTicketRequest = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  expirationDate: Date;
  isActive: boolean;
};

export type CreateTicketResponse = {
  id: string;
};
