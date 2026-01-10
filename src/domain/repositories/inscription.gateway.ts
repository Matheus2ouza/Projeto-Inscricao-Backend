import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  // CRUD básico
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract update(inscription: Inscription): Promise<Inscription>;
  abstract deleteInscription(id: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<Inscription | null>;

  // Buscas por relacionamento
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract findByEventId(filters?: {
    eventId: string;
    status?: InscriptionStatus[];
  }): Promise<Inscription[]>;
  abstract findByEventIdAndAccountId(
    eventId: string,
    accountId: string,
  ): Promise<Inscription[]>;
  abstract findManyByEventAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<Inscription[]>;
  abstract findMany(eventId: string): Promise<Inscription[]>;
  abstract findInscriptionsWithPayments(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<Inscription[]>;

  //COM O NOVA TABELA DE INSCRIÇÃO
  abstract findInscriptionsPending(
    page: number,
    pageSize: number,
    eventId: string,
    accountId: string,
    filter: {
      status: InscriptionStatus;
    },
  ): Promise<Inscription[]>;

  // Buscas paginadas
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    filters: {
      userId: string; // obrigatório
      eventId: string; // obrigatório
      limitTime?: string; // opcional
    },
  ): Promise<Inscription[]>;
  abstract findManyPaginatedByEvent(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Inscription[]>;
  abstract findLimitedByEvent(
    eventId: string,
    limit: number,
  ): Promise<Inscription[]>;

  abstract findInscriptionsWithPaid(eventId: string): Promise<Inscription[]>;

  // Agregações e contagens
  abstract contTotalDebtByEvent(eventId: string): Promise<number>;
  abstract countAll(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract countAllByEvent(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;
  abstract countParticipants(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract sumTotalDebt(filters: {
    userId: string; // obrigatório
    eventId: string; // obrigatório
    limitTime?: string; // opcional
  }): Promise<number>;
  abstract countTotalInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number>;
  abstract countPendingInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number>;
  abstract countTotalDebt(eventId: string, accountId: string): Promise<number>;
  abstract countInscriptionsWithPayments(eventId: string): Promise<number>;
  abstract countTotal(
    eventId: string,
    accountId: string,
    filter: {
      status?: InscriptionStatus;
    },
  ): Promise<number>;

  // Atualizações de status e valor
  abstract updateStatus(
    id: string,
    status: InscriptionStatus,
  ): Promise<Inscription>;
  abstract paidRegistration(id: string): Promise<Inscription>;
  abstract updateValue(id: string, value: number): Promise<Inscription>;
  abstract decrementValue(id: string, value: number): Promise<Inscription>; // Update do saldo devedor

  // Buscas de contas relacionadas
  abstract findUniqueAccountIdsByEventId(eventId: string): Promise<string[]>;
  abstract findUniqueAccountIdsPaginatedByEventId(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<{ accountIds: string[]; total: number }>;
}
