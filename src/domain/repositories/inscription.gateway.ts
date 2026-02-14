import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  // CRUD básico
  abstract create(inscription: Inscription): Promise<Inscription>;
  abstract update(inscription: Inscription): Promise<Inscription>;
  abstract updateMany(inscriptions: Inscription[]): Promise<number>;
  abstract delete(id: string): Promise<void>;
  abstract deleteMany(ids: string[]): Promise<number>;
  abstract cancel(inscription: Inscription): Promise<Inscription>;
  abstract deleteExpiredGuestInscription(
    ids: string[],
    expiredDate: Date,
  ): Promise<number>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<Inscription | null>;

  // Buscas por relacionamento
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;
  abstract findByPaymentId(paymentId: string): Promise<Inscription[]>;
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
  // Busca das inscrições Guest que expiraram
  abstract findManyGuestInscriptionExpired(now: Date): Promise<Inscription[]>;
  // Busca das inscrições Guest que foram marcadas como expiradas
  abstract findManyGuestInscriptionMarkedExpired(): Promise<Inscription[]>;

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
    eventId: string,
    page: number,
    pageSize: number,
    filters?: {
      isGuest?: boolean;
      limitTime?: string;
      accoundId?: string;
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
    eventId: string,
    filters: {
      isGuest?: boolean;
      limitTime?: string;
      accountId?: string;
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

  abstract countParticipants(inscriptionId: string): Promise<number>;
  abstract countUniqueAccountIdsByEventId(eventId: string): Promise<number>;
  abstract countUniqueAccountIdsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
  abstract countParticipantsByEventId(
    eventId: string,
    guest: boolean,
    status?: InscriptionStatus[],
  ): Promise<number>;
  abstract countParticipantsByEventIdAndGender(
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
