import { CashRegisterStatus } from 'generated/prisma';

export type FindDetailsCashRegisterRequest = {
  id: string;
};

export type FindDetailsCashRegisterResponse = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  initialBalance: number;
  balance: number;
  allocationEvents: AllocationEvent[];
  totalIncome: number;
  totalExpense: number;
  totalPix: number;
  totalCard: number;
  totalCash: number;
  expectedValues: number;
  expectedNetValues: number;
  openedAt: Date;
  closedAt?: Date;
};

type AllocationEvent = {
  id: string;
  name: string;
};
