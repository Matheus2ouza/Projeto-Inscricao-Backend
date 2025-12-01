export type FindAllWithPaymentsRequest = {
  regionId?: string;
  page: number;
  pageSize: number;
};

export type FindAllWithPaymentsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

type Events = {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  totalPayments: number;
  totalDebt: number;
}[];
