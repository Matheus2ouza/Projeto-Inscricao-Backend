import { roleType } from 'generated/prisma';
import { Account } from '../entities/account.entity';

export abstract class AccountGateway {
  abstract findByUser(username: string): Promise<Account | null>;
  abstract findById(id: string): Promise<Account | null>;
  abstract findRegionById(id: string): Promise<any | null>;
  abstract findByEventIdWithPagination(
    page: number,
    pageSize: number,
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<Account[]>;
  abstract findAllNames(roles?: roleType[]): Promise<Account[]>;
  abstract create(username: Account): Promise<void>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    regionId?: string,
  ): Promise<Account[]>;
  abstract findAll(): Promise<Account[]>;
  abstract countAll(regionId?: string): Promise<number>;
  abstract countAllFiltered(
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<number>;
  // Buscar múltiplos usuários por IDs
  abstract findByIds(ids: string[]): Promise<Account[]>;
}
