export type FindAccountsToCheckInRequest = {
  eventId: string;
  accountId?: string;
  withDebt?: boolean;
  page: number;
  pageSize: number;
};

export type FindAccountsToCheckInResponse = {
  event: EventHttp;
  total: number;
  page: number;
  pageCount: number;
};

export type EventHttp = {
  id: string;
  name: string;
  imageUrl: string;
  countAccounts: number;
  amountCollected: number;
  totalDebt: number;
  account: AccountHttp[];
};

export type AccountHttp = {
  id: string;
  username: string;
  status: string;
  countDebt: number;
  countPay: number;
  countInscriptions: number;
};

export type EventCheckInInfoResponse = {
  id: string;
  name: string;
  imageUrl: string;
  countAccounts: number;
  amountCollected: number;
  totalDebt: number;
};

export type AccountsPaginatedResponse = {
  accounts: AccountHttp[];
  total: number;
  page: number;
  pageCount: number;
};
