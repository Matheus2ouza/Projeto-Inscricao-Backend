export type ListAllPaymentsParam = {
  eventId: string;
};

export type ListAllPaymentsQuery = {
  localityId?: string;
  accountId: string;
  isGuest?: string | boolean;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsResponse = {
  summary: PaymentsSummary;
  payments: Payment[];
  total: number;
  page: number;
  pageCount: number;
};

export type PaymentsSummary = {
  totalPayments: number;
  totalPaidValue: number;
  totalUnderReviewValue: number;
  totalRefusedValue: number;
};

type Payment = {
  id: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  imageUrls: string[];
  rejectionReason?: string;
  allocation?: PaymentAllocation[];
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
};
