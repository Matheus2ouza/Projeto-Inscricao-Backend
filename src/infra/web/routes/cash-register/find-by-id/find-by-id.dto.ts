import { CashRegisterStatus } from 'generated/prisma';

export type FindDetailsCashRegisterRequest = {
  id: string;
};

export type FindDetailsCashRegisterResponse = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  allocationEvents: AllocationEvent[];
  openedAt: Date;
  closedAt?: Date;
};

type AllocationEvent = {
  id: string;
  name: string;
};
