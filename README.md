# API de Inscrições - Documentação das Rotas

Este documento descreve as rotas disponíveis na API para gerenciamento de eventos e tickets.

## 📋 Índice

- [Rotas de Eventos](#rotas-de-eventos)
- [Rotas de Tickets](#rotas-de-tickets)

---

## 🎪 Rotas de Eventos

### 1. Listar Eventos Paginados

**GET** `/events`

Lista todos os eventos com paginação.

#### Parâmetros de Query (opcionais):

```typescript
{
  page?: number;      // Página (padrão: 1)
  pageSize?: number;  // Tamanho da página (padrão: 10)
}
```

#### Resposta:

```typescript
{
  events: {
    id: string;
    name: string;
    quantityParticipants: number;
    amountCollected: number;
    startDate: Date;
    endDate: Date;
    imageUrl?: string;
    location: string;
    longitude?: number | null;
    latitude?: number | null;
    status: statusEvent;
    createdAt: Date;
    updatedAt: Date;
    regionName: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
}
```

---

### 2. Buscar Evento por ID

**GET** `/events/:id`

Busca um evento específico pelo ID.

#### Parâmetros de Rota:

```typescript
{
  id: string; // ID do evento
}
```

#### Resposta:

```typescript
{
  id: string;
  name: string;
  quantityParticipants: number;
  amountCollected: number;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEneble: boolean;
  createdAt: Date;
  updatedAt: Date;
  regionName: string;
}
```

**Nota:** Esta rota é pública (não requer autenticação).

---

### 3. Criar Evento

**POST** `/events/create`

Cria um novo evento.

#### Autenticação:

- Requer role de **ADMIN**

#### Corpo da Requisição:

```typescript
{
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  image?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  paymentEnabled: boolean;
}
```

#### Resposta:

```typescript
{
  id: string;
}
```

---

### 4. Listar Nomes de Todos os Eventos

**GET** `/events/all/names`

Retorna uma lista simples com ID e nome de todos os eventos.

#### Resposta:

```typescript
{
  id: string;
  name: string;
}
[];
```

---

### 5. Buscar Eventos para Carrossel

**GET** `/events/carousel`

Retorna eventos formatados para exibição em carrossel.

#### Resposta:

```typescript
{
  id: string;
  name: string;
  location: string;
  image: string;
}
[];
```

**Nota:** Esta rota é pública (não requer autenticação).

---

### 6. Listar Inscrições de um Evento

**GET** `/events/:id/inscriptions`

Lista as inscrições de um evento específico com paginação.

#### Parâmetros de Rota:

```typescript
{
  id: string; // ID do evento
}
```

#### Parâmetros de Query:

```typescript
{
  page: number;
  pageSize: number;
}
```

#### Resposta:

```typescript
{
  id: string;
  name: string;
  quantityParticipants: number;
  inscriptions: {
    id: string;
    responsible: string;
    phone: string;
    status: string;
  }
  [];
  total: number;
  page: number;
  pageCount: number;
}
```

---

### 7. Atualizar Status das Inscrições de um Evento

**PATCH** `/events/:id/update/inscriptions`

Atualiza o status das inscrições de um evento.

#### Parâmetros de Rota:

```typescript
{
  id: string; // ID do evento
}
```

#### Corpo da Requisição:

```typescript
{
  status: string; // Novo status das inscrições
}
```

#### Resposta:

```typescript
{
  id: string;
  InscriptionStatus: string;
}
```

---

### 8. Atualizar Status de Pagamento de um Evento

**PATCH** `/events/:id/update/payment`

Atualiza o status de pagamento de um evento.

#### Parâmetros de Rota:

```typescript
{
  id: string; // ID do evento
}
```

#### Corpo da Requisição:

```typescript
{
  paymentStatus: boolean; // Novo status de pagamento
}
```

#### Resposta:

```typescript
{
  id: string;
  paymentStatus: boolean;
}
```

---

## 🎫 Rotas de Tickets

### 1. Listar Tickets de um Evento

**GET** `/ticket/:eventId`

Lista todos os tickets disponíveis para um evento específico.

#### Parâmetros de Rota:

```typescript
{
  eventId: string; // ID do evento
}
```

#### Resposta:

```typescript
{
  id: string;
  eventId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}
[];
```

---

### 2. Criar Ticket

**POST** `/ticket/create`

Cria um novo ticket para um evento.

#### Corpo da Requisição:

```typescript
{
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}
```

#### Resposta:

```typescript
{
  id: string;
}
```

---

### 3. Vender Ticket

**POST** `/ticket/sale`

Realiza a venda de um ticket.

#### Corpo da Requisição:

```typescript
{
  ticketId: string;
  accountId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  pricePerTicket: number;
  status: StatusPayment;
}
```

#### Resposta:

```typescript
{
  id: string;
  ticketQuantity: number;
  ticketPdfBase64: string;
}
```

---

### 4. Buscar Detalhes de um Ticket

**GET** `/ticket/:eventTicketId/details`

Busca os detalhes completos de um ticket específico.

#### Parâmetros de Rota:

```typescript
{
  eventTicketId: string; // ID do ticket do evento
}
```

#### Resposta:

```typescript
{
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  ticketSale: {
    id: string;
    quantity: number;
    totalValue: number;
  }
  [];
}
```

---

## 📝 Notas Importantes

### Tipos de Status

- **statusEvent**: Enum que define os status possíveis para eventos
- **PaymentMethod**: Enum que define os métodos de pagamento disponíveis
- **StatusPayment**: Enum que define os status de pagamento

### Autenticação

- Algumas rotas requerem autenticação
- A rota de criação de eventos requer role de **ADMIN**
- Rotas marcadas como públicas não requerem autenticação

### Paginação

- As rotas que suportam paginação usam os parâmetros `page` e `pageSize`
- Valores padrão: `page = 1` e `pageSize = 10`

### Formato de Datas

- Todas as datas são enviadas e retornadas no formato ISO 8601
- Exemplo: `"2024-01-15T10:30:00.000Z"`

---

## 🔧 Exemplos de Uso

### Criar um Evento

```bash
curl -X POST http://localhost:3000/events/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Conferência de Tecnologia",
    "startDate": "2024-02-15T09:00:00.000Z",
    "endDate": "2024-02-15T18:00:00.000Z",
    "regionId": "region-123",
    "location": "Centro de Convenções",
    "status": "ACTIVE",
    "paymentEnabled": true
  }'
```

### Listar Tickets de um Evento

```bash
curl -X GET http://localhost:3000/ticket/event-123
```

### Vender um Ticket

```bash
curl -X POST http://localhost:3000/ticket/sale \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "ticket-123",
    "accountId": "account-456",
    "quantity": 2,
    "paymentMethod": "PIX",
    "pricePerTicket": 50.00,
    "status": "PENDING"
  }'
```
