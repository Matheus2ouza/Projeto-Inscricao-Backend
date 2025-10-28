export type FindAllPaginatedEventToPaymentRequest = {
  page?: number;
  pageSize?: number;
};

export type FindAllPaginatedEventToPaymentResponse = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    countPayments: number;
    countPaymentsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
