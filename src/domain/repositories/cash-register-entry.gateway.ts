import { CashEntryType } from 'generated/prisma';
import { CashRegisterEntry } from '../entities/cash-register-entry.entity';

export abstract class CashRegisterEntryGateway {
  abstract create(entry: CashRegisterEntry): Promise<CashRegisterEntry>;
  abstract createMany(cashRegisterEntry: CashRegisterEntry[]): Promise<void>;

  abstract findManyPaginated(
    cashRegisterId: string,
    page: number,
    pageSize: number,
    filters?: {
      type?: CashEntryType | CashEntryType[];
      limitTime?: string;
      orderBy?: 'desc' | 'asc';
    },
  ): Promise<CashRegisterEntry[]>;

  abstract countAll(
    cashRegisterId: string,
    filters?: {
      type?: CashEntryType | CashEntryType[];
      limitTime?: string;
      orderBy?: 'desc' | 'asc';
    },
  ): Promise<number>;
}
