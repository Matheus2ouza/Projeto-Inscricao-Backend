/**
 * Tabelas que podem ser sincronizadas
 */
export type SyncJobTable =
  | 'events'
  | 'typeInscriptions'
  | 'inscriptions'
  | 'participants'
  | 'accountParticipant'
  | 'accountParticipantInEvent'
  | 'payments'
  | 'paymentInstallment'
  | 'paymentAllocation'
  | 'financialMovement'
  | 'eventExpenses'
  | 'eventTickets'
  | 'ticketSale'
  | 'ticketSalePayment'
  | 'ticketSaleItem'
  | 'ticketUnit'
  | 'onSiteRegistration'
  | 'onSiteParticipant'
  | 'onSiteParticipantPayment'
  | 'cashRegister'
  | 'cashRegisterEvent'
  | 'cashRegisterEntry';

/**
 * Status possíveis de um job de sincronização
 *
 * IMPORTANTE: Esta é a ÚNICA fonte de verdade para status do job
 * - NÃO derive status de Redis structures (SETs, ZSETs, keys auxiliares)
 * - NÃO mantenha estado duplicado em outras estruturas
 * - O Redis guarda o JSON completo, mas o status só deve ser lido daqui
 *
 * Fluxo de status:
 * pending -> processing -> synced (sucesso)
 * pending -> processing -> pending (dependências pendentes)
 * pending -> processing -> failed (falha definitiva)
 * pending -> processing -> pending (retry programado)
 */
export type SyncJobStatus = 'pending' | 'processing' | 'synced' | 'failed';

/**
 * Job de sincronização
 *
 * 🧠 FONTE ÚNICA DE VERDADE
 *
 * Este JSON é a única representação autoritativa do estado do job.
 * Todas as outras estruturas Redis (filas, locks, caches) são apenas
 * infraestrutura auxiliar e NÃO definem estado.
 *
 * Regras:
 * 1. Sempre leia o job via getJob() para obter o estado atual
 * 2. Nunca infira status de keys Redis separadas
 * 3. Atualizações sempre passam pelos métodos do SyncQueue
 * 4. O Redis storage contém este JSON exato
 */
export type SyncJob = {
  /** Identificador único do job */
  id: string;

  /** Tabela de origem dos dados */
  table: SyncJobTable;

  /** ID do registro na tabela de origem */
  recordId: string;

  /** ✅ Status atual - Única fonte de verdade */
  status: SyncJobStatus;

  /** Número de tentativas já realizadas */
  attempts: number;

  /** Prioridade do job (menor = mais prioritário) */
  priority: number;

  /** Data de criação do job (ISO string) */
  createdAt: string;

  /** Data da última atualização (ISO string) */
  updatedAt: string;

  /** Próxima data programada para tentativa (ISO string) */
  nextRetryAt: string;

  /** Quando o processamento começou (null se nunca processado) */
  processingStartedAt: string | null;

  /** Último erro ocorrido (undefined se nenhum erro) */
  lastError?: string;
};

/**
 * Dependência entre jobs de sincronização
 *
 * Usado para garantir ordem de execução quando um registro
 * depende de outro para ser sincronizado primeiro.
 *
 * Exemplo: um pagamento depende do participante estar sincronizado.
 *
 * Nota: Dependências usam cache Redis (syncedKey) como otimização,
 * mas a fonte de verdade do estado de cada dependência continua sendo
 * o JSON do job correspondente.
 */
export type SyncJobDependency = {
  /** Tabela do registro dependente */
  table: SyncJobTable;

  /** ID do registro dependente */
  recordId: string;
};

/**
 * Estatísticas da fila de sincronização
 *
 * IMPORTANTE: Estas estatísticas devem ser computadas a partir
 * dos jobs (fonte única), não de SETs Redis separados.
 *
 * Exemplo de implementação:
 * - pending: jobs com status='pending' E nextRetryAt <= now
 * - processing: jobs com status='processing'
 * - synced: jobs com status='synced' (últimos N dias)
 * - failed: jobs com status='failed'
 */
export type SyncJobQueueStats = {
  pending: number;
  processing: number;
  synced: number;
  failed: number;
};

/**
 * Metadados de cache para registro sincronizado
 *
 * Isso é APENAS CACHE, NÃO é fonte de verdade!
 *
 * O sync.queue.ts usa esta estrutura para otimizar verificações
 * de dependências, mas nunca deve ser usado como autoridade
 * sobre o estado real do job.
 *
 * Se houver inconsistência entre este cache e o JSON do job,
 * o JSON do job SEMPRE prevalece.
 */
export type SyncedCacheMetadata = {
  jobId: string;
  syncedAt: string;
};

/**
 * Metadados de lock para job em processamento
 *
 * Isso é APENAS MECANISMO DE CONCORRÊNCIA
 *
 * O lock existe apenas para evitar que múltiplos workers
 * processem o mesmo job simultaneamente. Não define estado.
 */
export type LockMetadata = {
  jobId: string;
  lockedAt: string;
  lockedBy: string;
  ttlSeconds: number;
};
