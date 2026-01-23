export type ReportFinancialRequest = {
  eventId: string;
  details: boolean;
};

export type ReportFinancialResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  logo?: string;

  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  totalSpent: number;
  inscription: Inscription;
  inscriptionAvuls: InscriptionAvuls;
  ticketsSale: TicketSale;
  spent: Spent;
};

export type Inscription = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionDetail[];
};

export type InscriptionDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type InscriptionAvuls = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionAvulsDetail[];
};

export type InscriptionAvulsDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type TicketSale = {
  totalGeral: number;
  countTickets: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  details?: TicketSaleDetail[];
};

export type TicketSaleDetail = {
  id: string;
  name: string;
  quantity: number;
  pricePerTicket: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
};

export type Spent = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  spentDetails?: SpentDetail[];
};

export type SpentDetail = {
  id: string;
  createdAt: Date;
  totalSpent: number;
};
