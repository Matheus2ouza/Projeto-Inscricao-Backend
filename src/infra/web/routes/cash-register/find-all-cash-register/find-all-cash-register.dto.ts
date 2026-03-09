import { CashRegisterStatus } from 'generated/prisma';

export type FindAllCashRegisterRequest = {
  regionId?: string;
  status?: CashRegisterStatus[];
  page?: number;
  pageSize?: number;
};

export type FindAllCashRegisterResponse = {
  cashRegisters: CashRegister[];
  total: number;
  page: number;
  pageCount: number;
};

type CashRegister = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
};
