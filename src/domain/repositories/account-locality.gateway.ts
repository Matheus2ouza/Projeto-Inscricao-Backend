import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { AccountLocality } from '../entities/account-locality/account-locality.entity';

export abstract class AccountLocalityGateway {
  // creates
  abstract create(accountLocality: AccountLocality): Promise<AccountLocality>;
  abstract createTx(
    accountLocality: AccountLocality,
    tx: PrismaTransactionClient,
  ): Promise<AccountLocality>;
  abstract createMany(accountLocalities: AccountLocality[]): Promise<number>;
  abstract createManyTx(
    accountLocalities: AccountLocality[],
    tx: PrismaTransactionClient,
  ): Promise<number>;

  // buscas
  abstract findById(id: string): Promise<AccountLocality | null>;
}
