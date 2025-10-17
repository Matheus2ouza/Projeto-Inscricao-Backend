export type CreateTicketRequest = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

export type CreateTicketResponse = {
  id: string;
};
