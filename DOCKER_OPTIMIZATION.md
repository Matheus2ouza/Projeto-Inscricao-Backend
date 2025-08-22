# Otimização de Imagens Docker

Este projeto inclui várias versões otimizadas do Dockerfile para reduzir significativamente o tamanho das imagens Docker.

## 📊 Comparação de Tamanhos

| Versão | Tamanho | Redução |
|--------|---------|---------|
| Original | 750MB | - |
| Distroless | 546MB | 27% menor |
| Alpine | 505MB | 33% menor |

## 🚀 Como Usar

### Build Rápido
```bash
# Build da versão otimizada (recomendada)
docker build -f Dockerfile.optimized -t api-inscricao-nest:optimized .

# Build da versão Alpine
docker build -f Dockerfile.alpine -t api-inscricao-nest:alpine .

# Build da versão original
docker build -t api-inscricao-nest:original .
```

### Script Automatizado
```bash
# Executa todos os builds e mostra comparação
./build-docker.sh
```

### Executar Container
```bash
# Versão Distroless (mais segura)
docker run -p 3000:3000 api-inscricao-nest:distroless

# Versão Alpine (mais leve)
docker run -p 3000:3000 api-inscricao-nest:alpine
```

## 🔧 Otimizações Implementadas

### 1. Multi-Stage Build
- **Stage 1 (Deps)**: Instala apenas dependências de produção
- **Stage 2 (Builder)**: Compila o código TypeScript
- **Stage 3 (Production)**: Imagem final apenas com o necessário

### 2. Distroless Images
- Usa `gcr.io/distroless/nodejs18-debian12:nonroot`
- Remove ferramentas desnecessárias (shell, package managers, etc.)
- Executa como usuário não-root por segurança
- Reduz superfície de ataque

### 3. Alpine Linux
- Base Alpine Linux mais leve
- Usuário não-root para segurança
- `dumb-init` para gerenciamento adequado de sinais

### 4. .dockerignore Otimizado
- Exclui arquivos desnecessários do contexto de build
- Reduz tempo de build e tamanho da imagem
- Mantém apenas arquivos essenciais

### 5. Cache Optimization
- `npm ci --ignore-scripts` para instalação mais rápida
- `npm cache clean --force` para limpar cache desnecessário
- Separação de dependências de dev e produção

## 🛡️ Segurança

### Distroless
- ✅ Executa como usuário não-root
- ✅ Sem shell ou ferramentas de debug
- ✅ Superfície de ataque mínima
- ❌ Difícil debugging em produção

### Alpine
- ✅ Executa como usuário não-root
- ✅ Base Alpine Linux segura
- ✅ `dumb-init` para gerenciamento de sinais
- ✅ Mais fácil debugging que distroless

## 📁 Estrutura de Arquivos

```
├── Dockerfile              # Versão original (750MB)
├── Dockerfile.optimized    # Versão distroless (546MB)
├── Dockerfile.alpine       # Versão Alpine (505MB)
├── .dockerignore           # Arquivos excluídos do build
├── build-docker.sh         # Script de build automatizado
└── DOCKER_OPTIMIZATION.md  # Esta documentação
```

## 🎯 Recomendações

### Para Produção
- **Distroless**: Melhor segurança, menor superfície de ataque
- **Alpine**: Boa segurança, mais fácil debugging

### Para Desenvolvimento
- **Original**: Mais fácil debugging e troubleshooting

### Para CI/CD
- **Distroless**: Menor tempo de deploy, melhor segurança

## 🔍 Troubleshooting

### Problemas com Distroless
```bash
# Se precisar de debugging, use Alpine
docker run -it --entrypoint sh api-inscricao-nest:alpine
```

### Verificar Tamanho das Imagens
```bash
docker images api-inscricao-nest
```

### Limpar Imagens Antigas
```bash
docker rmi api-inscricao-nest:original api-inscricao-nest:distroless api-inscricao-nest:alpine
```
