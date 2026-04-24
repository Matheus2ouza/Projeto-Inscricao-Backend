import { CashRegisterStatus } from 'generated/prisma';

export type CreateCashRegisterRequest = {
  name: string;
  regionId?: string;
  status: CashRegisterStatus;
  initialBalance: number;
  balance: number;
  allocationEvent: string;
};

export type CreateCashRegisterResponse = {
  id: string;
  message?: string;
};
