import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  abstract findById(id: string): Promise<Inscription | null>;
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<Inscription[]>;
  abstract countAll(): Promise<number>;
}
