export type ListAllPaymentsPendingRequest = {
  accountId: string;
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsPendingResponse = {
  inscriptions: Inscriptions[];
  allowCard?: boolean;
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  eventId: string;
  accountId: string;
  totalValue: number;
  status: string;
  createAt: Date;
  canPay: boolean;
};
