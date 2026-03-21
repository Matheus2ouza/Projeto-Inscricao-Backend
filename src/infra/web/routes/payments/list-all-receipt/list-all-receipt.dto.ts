export type ListAllReceiptRequest = {
  eventId: string;
  accountId: string;
  page: number;
  pageSize: number;
};

export type ListAllReceiptResponse = {
  receipts: Receipt[];
  total: number;
  page: number;
  pageCount: number;
};

export type ReceiptSummary = {
  totalPayments: number;
  totalPaidValue: number;
  totalUnderReviewValue: number;
  totalRefusedValue: number;
};

type Receipt = {
  id: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  imageUrl: string;
};
