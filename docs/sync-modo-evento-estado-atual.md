# Sync no Modo Evento - Estado Atual (28/05/2026)

## Resumo executivo

O projeto já tem uma base funcional de sync offline-first para `EVENT_MODE=true` e, desde a última revisão, o fluxo de `inscriptions` passou a ter o lado receptor implementado na API de destino.

Hoje existe:

- Carregamento condicional do `SyncModule` por `EVENT_MODE`.
- Fila Redis com `LPUSH/RPOP` por tabela.
- Worker agendado que tenta sincronizar com a nuvem.
- Endpoint local `/health` com status online/offline e modo.
- Endpoint receptor `POST /sync/inscriptions` na API de destino.
- Guard dedicado para `x-sync-token`.
- Exception e filter genéricos para o caso de registro já existente no destino.
- Mapper de sync colocado junto da rota de sync, sem ficar dentro da camada de Prisma.
- `SYNC_TABLES_CONFIG` tipado com os nomes reais dos models do Prisma.

Ainda falta para bater com a ideia final:

- Alimentar a fila para todas as entidades críticas.
- Implementar os demais endpoints receptores `/sync/*` no mesmo padrão de `inscriptions`.
- Definir e implementar ordem completa de dependências entre tabelas.

## O que o código implementa hoje

### 1) Ativação por modo

- `EVENT_MODE=true` carrega `SyncModule`.
- Referências:
  - `src/app.module.ts`
  - `src/usecases/usecase.module.ts`

### 2) Monitoramento de conectividade

- `SyncService` executa verificação com `setInterval` a cada **5 segundos**.
- Checa `GET https://1.1.1.1` com timeout de 3s.
- Mantém `isOnline` e expõe `mode` (`EVENT`/`PROD`).
- Referência: `src/infra/sync/sync.service.ts`

### 3) Health endpoint

- `GET /health` retorna:
  - `status` (`ok`/`offline`)
  - `online` (boolean)
  - `mode`
  - `timestamp`
- Referência: `src/infra/sync/sync.controller.ts`

### 4) Fila Redis

- Estrutura de chave: `sync:queue:{table}`
- Operações:
  - `enqueue`: `LPUSH`
  - `dequeue`: `RPOP`
  - `requeue`: `LPUSH`
  - `size`: `LLEN`
- Referência: `src/infra/sync/sync.queue.ts`

### 5) Worker de processamento

- Cron: `*/15 * * * * *` (a cada **15 segundos**).
- Só executa se `syncService.isOnline === true`.
- Referência: `src/infra/sync/tasks/process-sync-queues/process-sync-queues.task.ts`

### 6) Estratégia de envio para nuvem

- Usa `SYNC_TABLES_CONFIG` tipado a partir do Prisma.
- O worker lê o model do Prisma pelo nome do config e busca o registro local antes de enviar.
- Para cada ID da fila:
  - busca registro no PostgreSQL local via Prisma
  - faz `POST {SYNC_API_URL}/sync/{table}` com `{ record }`
  - envia header `x-sync-token: SYNC_SECRET`
  - em falha transitória: devolve ID para fila (`requeue`)
  - em `409 Conflict`: trata como registro já sincronizado e segue adiante
- Referências:
  - `src/infra/sync/sync.config.ts`
  - `src/infra/workers/process-sync-queues/process-sync-queues.usecase.ts`

### 7) Pontos onde a fila é alimentada hoje

- Foi identificado `enqueue` explícito em:
  - `create-inscription-admin.usecase.ts` para `inscriptions`
- Referência:
  - `src/usecases/web/inscription/create-inscription-admin/create-inscription-admin.usecase.ts`

### 8) Receptor de sync para inscriptions

- Endpoint disponível:
  - `POST /sync/inscriptions`
- Proteção:
  - `x-sync-token` validado por `SyncTokenGuard`
- Fluxo:
  - converte `record` em entidade de domínio com mapper dedicado
  - usa `InscriptionGateway` para persistir
  - se já existir, lança `SyncRecordAlreadyExistsUsecaseException`
- Referências:
  - `src/infra/web/routes/sync/receive-sync-inscription/receive-sync-inscription.route.ts`
  - `src/infra/web/routes/sync/receive-sync-inscription/receive-sync-inscription.mapper.ts`
  - `src/usecases/web/sync/receive-sync-inscription/receive-sync-inscription.usecase.ts`
  - `src/infra/web/authenticator/guards/sync-token.guard.ts`
  - `src/usecases/web/exceptions/sync/sync-record-already-exists.usecase.exception.ts`
  - `src/infra/web/filters/usecases/sync/sync-record-already-exists.usecase.exception.filter.ts`

### 9) Tipagem do `SYNC_TABLES_CONFIG`

- O config deixou de usar `string` solta e passou a usar a tipagem do Prisma para os nomes de model.
- Isso reduz erro de digitação e mantém o config alinhado ao schema gerado.
- Referência:
  - `src/infra/sync/sync.config.ts`

## Diferenças entre documento/plano e código atual

1. Frequência do monitor de internet

- Plano antigo citava 15s.
- Código atual: 5s.

2. Escopo da alimentação da fila

- Plano assume várias entidades enfileirando continuamente.
- Código encontrado: enfileiramento confirmado de `inscriptions` em um fluxo específico.

3. Ordem completa de sync por dependência

- Plano traz uma ordem grande (inscriptions, payments, caixa, tickets etc.).
- O config já foi expandido em direção ao fluxo final, mas ainda precisa ser validado com o restante dos receivers e com a fila real alimentando todas as entidades.

4. Endpoints receptores `/sync/*`

- O receptor de `inscriptions` já existe e está protegido por `x-sync-token`.
- Os demais endpoints `/sync/*` ainda não foram implementados.

5. Plataforma de produção no texto

- O texto menciona Heroku, mas `.env.event` aponta `SYNC_API_URL` para Railway.

## Estado por fase (reavaliado)

### Fase 1 - Infra local

- Mantida como concluída (fora do escopo de código).

### Fase 2 - Backend

- Concluído:
  - `SyncModule` condicional por `EVENT_MODE`.
  - `SyncService` com monitor de internet.
  - `/health`.
  - Estrutura de fila Redis + worker cron.
  - `POST /sync/inscriptions` receptor na API de destino.
  - `SyncTokenGuard`.
  - exception/filter de sync para conflito de registro já existente.
  - tipagem do config de sync com base no Prisma.
- Parcial:
  - Sync de dados (implementado, mas cobertura de entidades ainda limitada).
- Pendente:
  - Expandir enfileiramento em todos os usecases críticos.
  - Implementar os demais receivers `/sync/*`.
  - Confirmar a ordem final de entidades no `SYNC_TABLES_CONFIG`.

### Fases 3, 5 e 6

- Não avaliadas neste documento (dependem de frontend/infra/scripts fora dos arquivos analisados).

## Riscos atuais

- Risco de lacuna de dados: operações que não fazem `enqueue` não serão sincronizadas.
- Risco de incompatibilidade: se destino não tiver `/sync/{table}` esperado, sync falha e reentra em loop de fila.
- Risco de ordem relacional: sem sequência completa por dependência, pode haver falhas por FK quando expandir tabelas.

## Próximos passos recomendados (curto prazo)

1. Mapear usecases de escrita e adicionar `enqueue` para cada entidade necessária.
2. Fechar a ordem oficial em `SYNC_TABLES_CONFIG` e validar se cada model listado tem receiver correspondente.
3. Implementar os próximos endpoints `/sync/*` no backend de destino com:
   - validação de `x-sync-token`
   - persistência via gateway ou mapper de domínio
   - tratamento de conflito quando o registro já existir
4. Adicionar observabilidade mínima:
  - contador de itens por fila
  - último sync com sucesso por tabela
5. Criar teste de integração do ciclo:
   - sem internet -> acumula fila
   - com internet -> drena fila

## Variáveis-chave hoje

- `EVENT_MODE`
- `SYNC_API_URL`
- `SYNC_SECRET`
- `DATABASE_URL`
- `REDIS_LOCAL_URL` / `REDIS_URL`

## Nota sobre segurança

O arquivo `.env.event` contém segredos sensíveis reais (SMTP, tokens, banco, Supabase etc.). Recomenda-se rotação desses segredos se já circularam fora de ambiente controlado.
