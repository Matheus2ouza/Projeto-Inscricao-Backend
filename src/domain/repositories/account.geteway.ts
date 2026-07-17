import { roleType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account/account.entity';

export abstract class AccountGateway {
  // ============ CREATES ============
  abstract create(account: Account): Promise<void>;

  // ============ FINDS ============
  abstract findById(id: string): Promise<Account | null>;
  abstract findByIds(ids: string[]): Promise<Account[]>;
  abstract findByUsername(username: string): Promise<Account | null>;
  abstract findRegionById(id: string): Promise<any | null>;
  abstract findAll(): Promise<Account[]>;
  abstract findAllNames(
    role: roleType[],
    regionId?: string,
  ): Promise<Account[]>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    regionId?: string,
  ): Promise<Account[]>;
  abstract findByEventIdWithPagination(
    page: number,
    pageSize: number,
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<Account[]>;

  // ============ COUNTS ============
  abstract countAll(regionId?: string): Promise<number>;
  abstract countAllFiltered(
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<number>;
  abstract countAccountsWithInscriptionsByEvent(
    eventId: string,
  ): Promise<number>;

  // ============ VALIDATIONS ============
  abstract verifyActiveAccount(username: string): Promise<Account | null>;
  abstract findEligibleResponsibles(ids: string[]): Promise<Account[]>;
}
