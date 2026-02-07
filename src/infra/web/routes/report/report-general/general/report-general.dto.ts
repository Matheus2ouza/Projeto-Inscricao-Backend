import { PaymentMethod } from 'generated/prisma';

export type ReportGeneralRequest = {
  eventId: string;
};

export type ReportGeneralResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  logo?: string;
  totalInscriptions: number;
  countTypeInscription: number;
  countParticipants: number;
  totalValue: number;
  totalDebt: number;

  typeInscriptions: TypeInscription;
  inscriptions: Inscription[];
  guestInscriptions: GuestInscription[];
  inscriptionAvuls: InscriptionAvuls;
  ticketSale: TicketSale;
  expenses: ExpensesReport;
  gastos: ExpensesReport;
};

type TypeInscription = {
  id: string;
  description: string;
  amount: number;
}[];

type Inscription = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: InscriptionPaymentMethodReport[];
};

type GuestInscription = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: GuestInscriptionPaymentMethodReport[];
};

type GuestInscriptionPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type InscriptionPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type InscriptionAvuls = {
  countParticipants: number;
  totalValue: number;
  byPaymentMethod: AvulsoPaymentMethodReport[];
};

type AvulsoPaymentMethodReport = {
  paymentMethod: PaymentMethod;
  countParticipants: number;
  totalValue: number;
};

type TicketSale = {
  totalSales: number; // soma dos valores de todas as vendas de ticket
  totalTicketsSold: number; // soma das quantidades de todos os itens vendidos
  byTicket: TicketSaleByTicket[]; // agrupado por ticket
  byPaymentMethod: TicketSaleByPaymentMethod[]; // agrupado por método de pagamento
};

type TicketSaleByTicket = {
  ticketId: string;
  ticketName: string;
  quantity: number;
  totalValue: number;
};

type TicketSaleByPaymentMethod = {
  paymentMethod: PaymentMethod;
  count: number;
  totalValue: number;
};

type ExpensesReport = {
  total: number;
  totalDinheiro: number;
  totalPix: number;
  totalCartao: number;
  gastos: ExpenseDetail[];
};

type ExpenseDetail = {
  id: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  createdAt: Date;
  updatedAt: Date;
};
