import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  abstract findById(id: string): Promise<Inscription | null>;
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract findByEventId(eventId: string): Promise<Inscription[]>;
  abstract findManyByEventAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<Inscription[]>;
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    filters: {
      userId: string; // obrigatório
      eventId: string; // obrigatório
      limitTime?: string; // opcional
    },
  ): Promise<Inscription[]>;
  abstract countAll(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract sumTotalDebt(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract countParticipants(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract findLimitedByEvent(
    eventId: string,
    limit: number,
  ): Promise<Inscription[]>;
  //Update do saldo devedor
  abstract decrementValue(id: string, value: number): Promise<Inscription>;
  abstract updateStatus(
    id: string,
    status: InscriptionStatus,
  ): Promise<Inscription>;
  abstract paidRegistration(id: string): Promise<Inscription>;
  abstract findMany(eventId: string): Promise<Inscription[]>;
  abstract findManyPaginatedByEvent(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Inscription[]>;
  abstract countAllByEvent(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;

  abstract deleteInscription(id: string): Promise<void>;

  //PDF
}
