export type UpdateTicketsSaleRequest = {
  saleTicketsEnabled: boolean;
};

export type UpdateTicketsSaleResponse = {
  id: string;
  ticketEnabled?: boolean;
};
