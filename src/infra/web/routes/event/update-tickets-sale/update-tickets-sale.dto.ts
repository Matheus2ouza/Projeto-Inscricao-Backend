export type UpdateTicketsSaleRequest = {
  saleTicketsStatus: boolean;
};

export type UpdateTicketsSaleResponse = {
  id: string;
  saleTicketsStatus?: boolean;
};
