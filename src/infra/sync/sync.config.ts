import { Prisma } from 'generated/prisma';
import { SyncJobDependency, SyncJobTable } from './sync.types';

export type PrismaModelName = Prisma.TypeMap['meta']['modelProps'];

/**
 * Configuracao de sincronizacao para uma tabela
 *
 * Isso eh APENAS CONFIGURACAO - NAO contem:
 * - Logica de estado
 * - Logica de execucao
 * - Conhecimento do Redis
 * - Regras de negocio temporais
 *
 * Apenas define:
 * - Qual tabela sincronizar
 * - Qual modelo Prisma usar
 * - Quais dependencias cada registro possui (opcional)
 */
export type SyncTableConfig = {
  /** Tabela que sera sincronizada */
  table: SyncJobTable;

  /** Modelo correspondente no Prisma */
  prismaModel: PrismaModelName;

  /**
   * Funcao opcional para extrair dependencias de um registro
   *
   * As dependencias sao usadas para garantir ordem de sincronizacao.
   * Exemplo: Um participante depende da inscricao estar sincronizada.
   *
   * IMPORTANTE: Dependencias NAO definem estado - sao apenas
   * uma verificacao de pre-condicao antes de executar o sync.
   */
  getDependencies?: (record: Record<string, unknown>) => SyncJobDependency[];
};

/**
 * Configuracao estatica de todas as tabelas sincronizaveis
 *
 * Esta eh a UNICA fonte de verdade para "o que sincronizar"
 *
 * Regras de manutencao:
 * 1. Adicione novas tabelas aqui quando necessario
 * 2. NUNCA adicione logica de estado ou Redis aqui
 * 3. NUNCA adicione regras de negocio temporais (retries, timeouts, etc.)
 * 4. Se precisar de condicionais complexas, refatore para uma funcao externa
 */
export const SYNC_TABLES_CONFIG: SyncTableConfig[] = [
  { table: 'events', prismaModel: 'events' },
  { table: 'typeInscriptions', prismaModel: 'typeInscriptions' },
  { table: 'inscriptions', prismaModel: 'inscription' },
  {
    table: 'participants',
    prismaModel: 'participant',
    getDependencies: (record) => [
      { table: 'inscriptions', recordId: String(record.inscriptionId) },
    ],
  },
  {
    table: 'accountParticipant',
    prismaModel: 'accountParticipant',
    getDependencies: (record) => [
      { table: 'inscriptions', recordId: String(record.inscriptionId) },
    ],
  },
  {
    table: 'accountParticipantInEvent',
    prismaModel: 'accountParticipantInEvent',
    getDependencies: (record) => [
      { table: 'inscriptions', recordId: String(record.inscriptionId) },
      {
        table: 'accountParticipant',
        recordId: String(record.accountParticipantId),
      },
    ],
  },
  { table: 'payments', prismaModel: 'payment' },
  {
    table: 'paymentInstallment',
    prismaModel: 'paymentInstallment',
    getDependencies: (record) => [
      { table: 'payments', recordId: String(record.paymentId) },
    ],
  },
  {
    table: 'paymentAllocation',
    prismaModel: 'paymentAllocation',
    getDependencies: (record) => [
      { table: 'payments', recordId: String(record.paymentId) },
      { table: 'inscriptions', recordId: String(record.inscriptionId) },
    ],
  },
  { table: 'eventExpenses', prismaModel: 'eventExpenses' },
  { table: 'cashRegister', prismaModel: 'cashRegister' },
  { table: 'cashRegisterEvent', prismaModel: 'cashRegisterEvent' },
  {
    table: 'cashRegisterEntry',
    prismaModel: 'cashRegisterEntry',
    getDependencies: (record) => {
      const dependencies: SyncJobDependency[] = [];

      if (record.cashRegisterId) {
        dependencies.push({
          table: 'cashRegister',
          recordId: String(record.cashRegisterId),
        });
      }

      if (record.paymentInstallmentId) {
        dependencies.push({
          table: 'paymentInstallment',
          recordId: String(record.paymentInstallmentId),
        });
      }

      if (record.eventExpenseId) {
        dependencies.push({
          table: 'eventExpenses',
          recordId: String(record.eventExpenseId),
        });
      }

      return dependencies;
    },
  },
] satisfies SyncTableConfig[];

/**
 * Mapa de acesso rapido por tabela
 *
 * Performance optimization - O(1) lookup
 */
export const SYNC_TABLE_CONFIG_BY_TABLE = new Map<
  SyncJobTable,
  SyncTableConfig
>(SYNC_TABLES_CONFIG.map((config) => [config.table, config]));

/**
 * Validacao de integridade da configuracao (opcional)
 *
 * Util para detectar erros de configuracao em tempo de inicializacao
 */
export function validateSyncConfig(): void {
  const missingModels: string[] = [];

  for (const config of SYNC_TABLES_CONFIG) {
    // Verificar se o modelo Prisma existe (validacao basica)
    if (!config.prismaModel || typeof config.prismaModel !== 'string') {
      missingModels.push(`Table ${config.table}: invalid prismaModel`);
    }

    // Verificar se getDependencies retorna array (se definido)
    if (config.getDependencies) {
      try {
        const testResult = config.getDependencies({});
        if (!Array.isArray(testResult)) {
          throw new Error(`getDependencies must return an array`);
        }
      } catch (error) {
        throw new Error(
          `Invalid getDependencies for table ${config.table}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }
  }

  if (missingModels.length > 0) {
    throw new Error(
      `Sync config validation failed:\n${missingModels.join('\n')}`,
    );
  }
}
