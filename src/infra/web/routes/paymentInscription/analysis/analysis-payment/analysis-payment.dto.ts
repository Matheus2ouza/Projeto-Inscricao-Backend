export type AnalysisPaymentRequest = {
  page: number;
  pageSize: number;
};

export type AnalysisPaymentResponse = {
  inscription: Inscription;
  total: number;
  page: number;
  pageCount: number;
};

type Inscription = {
  id: string;
  status: string;
  responsible: string;
  phone: string;
  email?: string;
  totalValue: number;
  payments: Payments;
};

type Payments = {
  id: string;
  status: string;
  value: number;
  image: string | undefined;
}[];
