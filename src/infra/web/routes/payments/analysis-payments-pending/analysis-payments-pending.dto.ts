export type AnalysisPaymentsPendingRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type AnalysisPaymentsPendingResponse = {
  event: Event;
  payments: Payment[];
  total: number;
  page: number;
  pageCount: number;
};

export type Event = {
  id: string;
  name: string;
  imageUrl: string;
  paymentEnabled: boolean;
  totalPaymentInAnalysis: number;
  totalAmountInAnalysis: number;
};

export type Payment = {
  id: string;
  responsible?: string;
  status: string;
  isGuest: boolean;
  value: number;
  createdAt: Date;
};
