export type FindAllTicketRequest = {
  eventId: string;
};

export type FindAllTicketResponse = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}[];
