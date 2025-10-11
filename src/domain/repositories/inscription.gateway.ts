import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  abstract findById(id: string): Promise<Inscription | null>;
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    filters: {
      userId: string; // obrigatório
      eventId?: string; // opcional
      limitTime?: string; // opcional
    },
  ): Promise<Inscription[]>;
  abstract countAll(filters: {
    userId: string; // obrigatório
    eventId?: string; // opcional
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract sumTotalDebt(filters: {
    userId: string; // obrigatório
    eventId?: string; // opcional
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract countParticipants(filters: {
    userId: string; // obrigatório
    eventId?: string; // opcional
    limitTime?: string; // opcional
  }): Promise<number>;
}
