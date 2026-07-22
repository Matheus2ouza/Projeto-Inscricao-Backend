import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { Locality } from '../entities/locality/locality.entity';

export abstract class LocalityGateway {
  // creates
  abstract create(locality: Locality): Promise<Locality>;
  abstract createTx(
    locality: Locality,
    tx: PrismaTransactionClient,
  ): Promise<Locality>;
  abstract createMany(localities: Locality[]): Promise<number>;
  abstract createManyTx(
    localities: Locality[],
    tx: PrismaTransactionClient,
  ): Promise<number>;

  // buscas
  // busca a localidade pelo id
  abstract findById(id: string): Promise<Locality | null>;
  // busca múltiplas localidades pelo um array de ids
  abstract findByIds(ids: string[]): Promise<Locality[]>;
  abstract findByAccountId(accountId: string): Promise<Locality[]>;
  abstract findByAccountIdAndLocalities(
    accountId: string,
    localityId?: string,
  ): Promise<Locality[]>;
  abstract findAll(): Promise<Locality[]>;
}
