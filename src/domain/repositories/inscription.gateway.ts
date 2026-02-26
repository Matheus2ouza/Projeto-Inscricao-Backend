import { genderType, InscriptionStatus } from 'generated/prisma';
import { Inscription } from '../entities/inscription.entity';

export abstract class InscriptionGateway {
  // CRUD básico
  // Cria uma nova inscrição
  abstract create(inscription: Inscription): Promise<Inscription>;

  // Atualiza uma inscrição existente
  abstract update(inscription: Inscription): Promise<Inscription>;

  // Atualiza múltiplas inscrições
  abstract updateMany(inscriptions: Inscription[]): Promise<number>;

  // Remove uma inscrição pelo ID
  abstract delete(id: string): Promise<void>;

  // Remove múltiplas inscrições pelos IDs
  abstract deleteMany(ids: string[]): Promise<number>;

  // Cancela uma inscrição
  abstract cancel(inscription: Inscription): Promise<Inscription>;

  // Remove inscrições de guest expiradas
  abstract deleteExpiredGuestInscription(
    ids: string[],
    expiredDate: Date,
  ): Promise<number>;

  // Buscas por identificador único
  // Busca uma inscrição pelo ID
  abstract findById(id: string): Promise<Inscription | null>;

  // Buscas por relacionamento
  // Busca inscrições pelo ID da conta
  abstract findByAccountId(accountId: string): Promise<Inscription[]>;

  // Busca inscrições pelo ID do pagamento
  abstract findByPaymentId(paymentId: string): Promise<Inscription[]>;

  // Busca inscrições pelo ID do evento com filtros opcionais de status
  abstract findByEventId(filters?: {
    eventId: string;
    status?: InscriptionStatus[];
  }): Promise<Inscription[]>;

  // Busca inscrições pelo ID do evento e ID da conta
  abstract findByEventIdAndAccountId(
    eventId: string,
    accountId: string,
  ): Promise<Inscription[]>;

  // Busca múltiplas inscrições pelo ID do evento e lista de IDs de contas
  abstract findManyByEventAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<Inscription[]>;

  // Busca todas as inscrições de um evento
  abstract findMany(eventId: string, isGuest?: boolean): Promise<Inscription[]>;

  // Busca múltiplas inscrições pelos IDs
  abstract findManyByIds(ids: string[]): Promise<Inscription[]>;

  // Busca inscrições com pagamentos de forma paginada
  abstract findInscriptionsWithPayments(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<Inscription[]>;

  // Busca a inscrição por codigo de confirmação,
  // levando em consideração que a inscrição não pode estar expirada e nem ter expirado
  abstract findByConfirmationCode(
    confirmationCode: string,
  ): Promise<Inscription | null>;

  // Busca das inscrições Guest que expiraram
  abstract findManyGuestInscriptionExpired(now: Date): Promise<Inscription[]>;

  // Busca das inscrições Guest que foram marcadas como expiradas
  abstract findManyGuestInscriptionMarkedExpired(): Promise<Inscription[]>;

  // COM O NOVA TABELA DE INSCRIÇÃO
  // Busca inscrições pendentes de forma paginada
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
  // Busca inscrições de forma paginada com filtros opcionais
  abstract findManyPaginated(
    eventId: string,
    page: number,
    pageSize: number,
    filters?: {
      status?: InscriptionStatus | InscriptionStatus[];
      isGuest?: boolean;
      accountId?: string;
      orderBy?: 'asc' | 'desc';
      limitTime?: string;
    },
  ): Promise<Inscription[]>;

  // Busca inscrições de um evento de forma paginada
  abstract findManyPaginatedByEvent(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Inscription[]>;

  // Busca um número limitado de inscrições de um evento
  abstract findLimitedByEvent(
    eventId: string,
    limit: number,
  ): Promise<Inscription[]>;

  // Busca inscrições com status pago de um evento
  abstract findInscriptionsWithPaid(eventId: string): Promise<Inscription[]>;

  // Busca IDs de contas de um evento de forma paginada
  abstract findAccountIdsByEventIdPaginated(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<string[]>;

  // Agregações e contagens
  // Calcula o total da dívida de um evento
  abstract contTotalDebtByEvent(eventId: string): Promise<number>;

  // Conta todas as inscrições de um evento com filtros
  abstract countAll(
    eventId: string,
    filters: {
      status?: InscriptionStatus | InscriptionStatus[];
      isGuest?: boolean;
      limitTime?: string;
      accountId?: string;
    },
  ): Promise<number>;

  // Conta todas as inscrições de um evento
  abstract countAllByEvent(eventId: string, isGuest?: boolean): Promise<number>;

  // Conta todas as inscrições em análise de um evento
  abstract countAllInAnalysis(eventId: string): Promise<number>;

  // Conta o total de inscrições de uma conta em um evento
  abstract countTotalInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number>;

  // Conta as inscrições pendentes de uma conta em um evento
  abstract countPendingInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number>;

  // Calcula o total da dívida de uma conta em um evento
  abstract countTotalDebt(eventId: string, accountId: string): Promise<number>;

  // Conta inscrições com pagamentos de um evento
  abstract countInscriptionsWithPayments(eventId: string): Promise<number>;

  // Conta o total de inscrições pendentes de uma conta em um evento
  abstract countTotal(eventId: string, accountId: string): Promise<number>;

  // Conta todas as inscrições de um evento como guest
  abstract countAllGuestByEvent(eventId: string): Promise<number>;

  // Busca o total de participantes referente ao evento,
  // somando o total de participantes (guest) e accountParticipantInEvent
  abstract countParticipantsByEventId(
    eventId: string,
    guest?: boolean,
    status?: InscriptionStatus[],
  ): Promise<number>;

  // Busca o total de participantes de um sexo específico referente ao evento,
  // somando o total de participantes (guest) e accountParticipantInEvent
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;

  // Conta o número de participantes de uma inscrição
  abstract countParticipants(inscriptionId: string): Promise<number>;

  // Conta o número de contas únicas em um evento
  abstract countUniqueAccountIdsByEventId(eventId: string): Promise<number>;

  // Conta o número de contas únicas em um evento filtrado por gênero
  abstract countUniqueAccountIdsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;

  // Atualizações de status e valor
  // Atualiza o status de uma inscrição
  abstract updateStatus(
    id: string,
    status: InscriptionStatus,
  ): Promise<Inscription>;

  // Marca uma inscrição como paga
  abstract paidRegistration(id: string): Promise<Inscription>;

  // Atualiza o valor total de uma inscrição
  abstract updateValue(id: string, value: number): Promise<Inscription>;

  // Decrementa o valor total de uma inscrição (Update do saldo devedor)
  abstract decrementValue(id: string, value: number): Promise<Inscription>;

  // Incrementa o valor total pago de uma inscrição
  abstract incrementTotalPaid(id: string, value: number): Promise<Inscription>;

  // Incrementa o valor total pago de múltiplas inscrições
  abstract incrementTotalPaidMany(
    increments: { inscriptionId: string; value: number }[],
  ): Promise<void>;

  // Buscas de contas relacionadas
  // Busca IDs de contas únicas em um evento
  abstract findUniqueAccountIdsByEventId(eventId: string): Promise<string[]>;
}
