import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  // CRUD básico
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract update(inscription: Inscription): Promise<Inscription>;
  abstract delete(id: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<Inscription | null>;

  // Buscas por relacionamento
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract findByPaymentId(paymentId: string): Promise<Inscription | null>;
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
  abstract findManyByIds(ids: string[]): Promise<Inscription[]>;
  abstract findInscriptionsWithPayments(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<Inscription[]>;
  abstract findByConfirmationCode(
    confirmationCode: string,
  ): Promise<Inscription | null>;

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
    accoundId: string,
    eventId: string,
    page: number,
    pageSize: number,
    filters: {
      limitTime?: string;
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
  abstract findAccountIdsByEventIdPaginated(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<string[]>;

  // Agregações e contagens
  abstract contTotalDebtByEvent(eventId: string): Promise<number>;
  abstract countAll(
    accountId: string,
    eventId: string,
    filters: {
      limitTime?: string;
    },
  ): Promise<number>;
  abstract countAllByEvent(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;
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
  abstract countUniqueAccountIdsByEventId(eventId: string): Promise<number>;
  abstract countUniqueAccountIdsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;

  // Atualizações de status e valor
  abstract updateStatus(
    id: string,
    status: InscriptionStatus,
  ): Promise<Inscription>;
  abstract paidRegistration(id: string): Promise<Inscription>;
  abstract updateValue(id: string, value: number): Promise<Inscription>;
  abstract decrementValue(id: string, value: number): Promise<Inscription>; // Update do saldo devedor
  abstract incrementTotalPaid(id: string, value: number): Promise<Inscription>; // Incrementa o valor total pago
  abstract incrementTotalPaidMany(
    increments: { inscriptionId: string; value: number }[],
  ): Promise<void>;

  // Buscas de contas relacionadas
  abstract findUniqueAccountIdsByEventId(eventId: string): Promise<string[]>;
}
