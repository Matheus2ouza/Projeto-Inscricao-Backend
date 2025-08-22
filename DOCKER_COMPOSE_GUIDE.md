# Docker Compose - Guia Completo

Este guia explica como usar o `docker-compose.yml` para simular um ambiente Heroku Eco Dyno com sua aplicação NestJS.

## 🎯 Objetivo

O `docker-compose.yml` foi configurado para simular as limitações e características do Heroku Eco Dyno:
- Limites de recursos (512MB RAM, 0.5 CPU cores)
- Restart automático
- Segurança não privilegiada
- Logs centralizados
- Health checks

## 📁 Arquivos Criados

```
├── docker-compose.yml          # Configuração principal
├── docker-compose.sh           # Script de gerenciamento
├── env.example                 # Exemplo de variáveis de ambiente
└── logs/                       # Pasta para logs
```

## 🚀 Como Usar

### 1. Preparação Inicial

```bash
# Copie o arquivo de exemplo de variáveis de ambiente
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 2. Variáveis de Ambiente Obrigatórias

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# JWT Secrets (gerar strings longas e aleatórias)
JWT_AUTH_SECRECT="sua-chave-secreta-jwt-auth-muito-longa-e-aleatoria"
JWT_REFRESH_SECRET="sua-chave-secreta-jwt-refresh-muito-longa-e-aleatoria"

# Configurações da Aplicação
NODE_ENV="production"
PORT=3000
```

### 3. Usando o Script Automatizado

```bash
# Verificar ajuda
./docker-compose.sh help

# Construir imagem
./docker-compose.sh build

# Iniciar aplicação
./docker-compose.sh up

# Verificar status
./docker-compose.sh status

# Ver logs
./docker-compose.sh logs

# Ver logs em tempo real
./docker-compose.sh logs -f

# Parar aplicação
./docker-compose.sh down

# Reiniciar aplicação
./docker-compose.sh restart

# Verificar recursos do sistema
./docker-compose.sh resources

# Limpar tudo (containers, volumes, imagens)
./docker-compose.sh clean
```

### 4. Usando Docker Compose Diretamente

```bash
# Iniciar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver status
docker-compose ps

# Parar
docker-compose down

# Reconstruir e iniciar
docker-compose up --build -d
```

## 📊 Configurações de Recursos

### Heroku Eco Dyno Simulado

| Recurso | Limite | Reserva |
|---------|--------|---------|
| **Memória** | 512MB | 256MB |
| **CPU** | 0.5 cores | 0.25 cores |
| **Rede** | Bridge | - |
| **Storage** | Volume local | - |

### Comparação com Heroku Real

| Característica | Heroku Eco Dyno | Docker Compose |
|----------------|------------------|----------------|
| **Memória** | 512MB | 512MB |
| **CPU** | 0.5 cores | 0.5 cores |
| **Sleep** | Sim (30min) | Não |
| **Restart** | Automático | Automático |
| **Logs** | Centralizados | Centralizados |
| **Segurança** | Isolado | Isolado |

## 🔧 Configurações Técnicas

### Segurança

```yaml
# Modo não privilegiado
security_opt:
  - no-new-privileges:true

# Usuário não-root
user: "nonroot:nonroot"
```

### Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logs

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Rede

```yaml
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Memória
```bash
# Verificar memória disponível
./docker-compose.sh resources

# Se insuficiente, reduzir limites no docker-compose.yml
memory: 256M  # Reduzir de 512M para 256M
```

#### 2. Erro de Variáveis de Ambiente
```bash
# Verificar se .env existe
ls -la .env

# Se não existir, copiar do exemplo
cp env.example .env
```

#### 3. Erro de Porta
```bash
# Verificar se porta 3000 está livre
netstat -tulpn | grep :3000

# Se ocupada, mudar no docker-compose.yml
ports:
  - "3001:3000"  # Mudar de 3000:3000 para 3001:3000
```

#### 4. Erro de Banco de Dados
```bash
# Verificar se DATABASE_URL está correto
echo $DATABASE_URL

# Testar conexão
docker-compose exec web npx prisma db push
```

### Comandos Úteis

```bash
# Entrar no container
docker-compose exec web sh

# Ver logs detalhados
docker-compose logs web --tail=100

# Ver uso de recursos
docker stats

# Limpar cache do Docker
docker system prune -f
```

## 📈 Monitoramento

### Verificar Status

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats --no-stream

# Logs em tempo real
docker-compose logs -f web
```

### Métricas Importantes

- **Memória**: Deve ficar abaixo de 512MB
- **CPU**: Deve ficar abaixo de 50%
- **Logs**: Verificar erros e warnings
- **Health Check**: Deve retornar "healthy"

## 🔄 Deploy e CI/CD

### Para Produção

1. **Build da imagem**:
   ```bash
   docker build -f Dockerfile.optimized -t api-inscricao-nest:optimized .
   ```

2. **Configurar variáveis**:
   ```bash
   # Copiar .env de produção
   cp .env.production .env
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Para Desenvolvimento

1. **Usar imagem de desenvolvimento**:
   ```yaml
   image: api-inscricao-nest:alpine  # Mais fácil para debug
   ```

2. **Mapear volumes**:
   ```yaml
   volumes:
     - ./src:/app/src:ro  # Para hot reload
   ```

## 📚 Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Heroku Dyno Types](https://devcenter.heroku.com/articles/dyno-types)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/docker)
