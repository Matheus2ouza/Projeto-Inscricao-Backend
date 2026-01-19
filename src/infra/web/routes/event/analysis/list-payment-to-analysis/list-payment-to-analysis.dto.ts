export type ListPaymentToAnalysisRequest = {
  page?: number;
  pageSize?: number;
  eventId: string;
};

export type ListPaymentToAnalysisResponse = {
  inscriptions: Inscriptions[];
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  accountName?: string;
  responsible: string;
  totalValue: number;
  countPayments: number;
  payments: Payments[];
};

type Payments = {
  id: string;
  value: number;
  date: Date;
};
