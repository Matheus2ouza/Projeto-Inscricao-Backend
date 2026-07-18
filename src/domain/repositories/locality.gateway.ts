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
  abstract findById(id: string): Promise<Locality | null>;
  abstract findByAccountId(accountId: string): Promise<Locality[]>;
  abstract findAll(): Promise<Locality[]>;
}
