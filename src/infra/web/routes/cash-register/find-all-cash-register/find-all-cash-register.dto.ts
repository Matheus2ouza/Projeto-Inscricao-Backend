import { CashRegisterStatus } from 'generated/prisma';

export type FindAllCashRegisterRequest = {
  regionId?: string;
};

export type FindAllCashRegisterResponse = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
}[];
