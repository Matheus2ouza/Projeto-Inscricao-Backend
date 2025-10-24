# Sistema de Notificação por E-mail - Configuração e Uso

Este documento descreve como configurar e usar o sistema de notificação por e-mail implementado no projeto.

## 🚀 Configuração

### 1. Configuração SMTP

O sistema usa Nodemailer para envio de e-mails via SMTP. Você pode usar qualquer provedor SMTP:

#### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Outros Provedores

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

#### Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
```

#### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 2. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@yourdomain.com

# Redis Configuration (para cache de URLs de imagens)
REDIS_URL=redis://localhost:6379
```

### 3. Instalação de Dependências

Execute o comando para instalar as novas dependências:

```bash
npm install
```

As seguintes dependências foram adicionadas:

- `nodemailer`: Para envio de e-mails via SMTP
- `@types/nodemailer`: Tipos TypeScript para Nodemailer
- `ioredis`: Para cache de URLs de imagens (já existente)

### 4. Build e Deploy

O sistema usa templates HTML inline, não precisando de arquivos externos:

```bash
# Build normal
npm run build
```

**Vantagens**:

- Não há dependência de arquivos externos, o sistema é mais robusto e portável
- Suporte a múltiplos provedores SMTP (Gmail, Outlook, Amazon SES, SendGrid, etc.)
- Maior flexibilidade de configuração
- Melhor controle sobre o envio de e-mails

## 📧 Funcionalidades Implementadas

### 1. **Handler de E-mail de Inscrição** (`InscriptionEmailHandler`)

- Envia e-mails de notificação quando uma inscrição é confirmada
- Suporte a cache de URLs de imagens do evento
- Template HTML responsivo e moderno
- Tratamento de erros robusto

### 2. **Template HTML Inline Responsivo**

- Template HTML completo embutido no código
- Design moderno e responsivo
- Suporte a imagens do evento (com cache)
- Informações completas da inscrição
- Resumo da inscrição com dados essenciais
- Formatação de moeda e datas em português
- Não depende de arquivos externos

### 3. **Sistema de Cache Inteligente**

- Cache de URLs de imagens por 7 dias
- Fallback para URL original em caso de erro
- Integração com Redis existente

## 📋 Como Funciona

### Fluxo de Envio de E-mail

1. **Inscrição Confirmada**: Quando uma inscrição é confirmada (individual ou em grupo)
2. **Busca de Responsáveis do Evento**: Sistema busca os responsáveis cadastrados na tabela `EventResponsibles`
3. **Busca de E-mails**: Obtém os e-mails dos responsáveis da tabela `Accounts`
4. **Preparação dos Dados**: Coleta informações do evento, inscrição e participantes
5. **Cache de Imagem**: Verifica cache para URL da imagem do evento
6. **Renderização do Template**: Gera HTML com os dados coletados
7. **Envio de E-mail**: Envia para todos os responsáveis do evento com e-mail cadastrado

### Estrutura do E-mail

O e-mail inclui:

- **Cabeçalho**: Nome do evento e imagem (se disponível)
- **Informações do Evento**: Data, local, etc.
- **Dados do Responsável**: Nome, telefone, e-mail
- **Resumo da Inscrição**:
  - Quantidade de participantes
  - Conta responsável pela inscrição
  - Data e hora da inscrição
- **Valor Total**: Valor total da inscrição
- **Lista de Destinatários**: Para quem o e-mail foi enviado

## 🔧 Configuração Avançada

### Cache de Imagens

O sistema implementa cache inteligente para URLs de imagens:

```typescript
// Cache por 7 dias (604800 segundos)
const cacheKey = `event_image_url:${imageUrl}`;
await this.redisService.setJson(cacheKey, publicUrl, 604800);
```

### Tratamento de Erros

- **Sem Responsáveis**: Log de aviso, não quebra o fluxo
- **Erro de E-mail**: Log de erro, não quebra o fluxo principal
- **Imagem Não Encontrada**: Usa URL original como fallback

### Personalização do Template

O template HTML está localizado em:

```
src/infra/services/mail/templates/inscription-email.template.html
```

Você pode personalizar:

- Cores e estilos CSS
- Layout e estrutura
- Conteúdo e mensagens
- Formatação de dados

## 📊 Monitoramento

### Logs Implementados

- **Sucesso**: `E-mail de inscrição enviado para {username} ({email})`
- **Aviso**: `Evento {eventId} não possui responsáveis cadastrados`
- **Erro**: `Erro ao enviar e-mail de notificação de inscrição: {error}`

### Métricas Recomendadas

- Taxa de entrega de e-mails
- Tempo de processamento
- Erros de envio
- Uso do cache de imagens

## 🚨 Limitações Atuais

### 1. **E-mail dos Responsáveis**

- E-mails são enviados apenas se o responsável tiver e-mail cadastrado na tabela `Accounts`
- Se o responsável não tiver e-mail, apenas é logado um aviso
- O sistema funciona corretamente quando os responsáveis têm e-mail cadastrado

### 2. **Templates Estáticos**

- Templates são renderizados com substituição simples de strings
- Não há engine de templates avançada (Handlebars, Mustache, etc.)
- Para templates mais complexos, considere implementar uma engine

### 3. **Configuração de E-mail**

- E-mail do remetente é fixo via variável de ambiente
- Não há suporte a múltiplos remetentes
- Assunto é gerado automaticamente

## 🔮 Melhorias Futuras

### 1. **Engine de Templates**

- Implementar Handlebars ou Mustache
- Suporte a loops e condicionais avançados
- Templates dinâmicos

### 2. **Configuração Avançada**

- Múltiplos remetentes por região
- Templates personalizáveis por evento
- Configuração de assuntos dinâmicos

### 3. **Analytics de E-mail**

- Tracking de abertura
- Tracking de cliques
- Relatórios de entrega

## 🧪 Testes

### Teste Manual

1. **Criar um Evento** com responsáveis
2. **Fazer uma Inscrição** (individual ou em grupo)
3. **Verificar Logs** para confirmação de envio
4. **Verificar E-mail** do responsável

### Teste de Cache

```bash
# Verificar cache no Redis
redis-cli
> KEYS event_image_url:*
> GET event_image_url:your-image-url
```

## 📝 Exemplo de Uso

### E-mail Enviado

```
Assunto: Nova Inscrição - Evento de Tecnologia 2024

Conteúdo:
- Imagem do evento (se disponível)
- Informações do evento
- Dados do responsável pela inscrição
- Resumo da inscrição:
  * Quantidade de participantes: 5
  * Conta responsável: admin
  * Data da inscrição: 15/01/2024
  * Hora da inscrição: 14:30:25
- Valor total: R$ 250,00
- Lista de destinatários (responsáveis do evento)
- Data de envio
```

**Nota**: O e-mail é enviado para os **responsáveis do evento** (tabela `EventResponsibles`), não para quem fez a inscrição.

### Logs de Exemplo

```
[INFO] E-mail de inscrição enviado para admin (admin@example.com)
[WARN] Evento 123 não possui responsáveis cadastrados
[ERROR] Erro ao enviar e-mail de notificação de inscrição: Invalid API key
```

## 🆘 Solução de Problemas

### E-mail Não Enviado

1. **Verificar Configuração SMTP**
2. **Verificar Credenciais de E-mail**
3. **Verificar Logs de Erro**
4. **Verificar Conexão com Redis**

### Template Não Renderizado

1. **Verificar Dados de Entrada**
2. **Verificar Logs de Renderização**
3. **Template Inline**: O sistema usa template HTML inline, não há arquivos externos

### Cache Não Funcionando

1. **Verificar Conexão Redis**
2. **Verificar TTL do Cache**
3. **Verificar Chaves de Cache**

---

**Nota**: Este sistema foi implementado para ser robusto e não quebrar o fluxo principal de inscrições. Erros de e-mail são logados mas não impedem a conclusão da inscrição.
