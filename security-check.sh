#!/bin/bash

# Script de Verificação de Segurança
# Verifica se há arquivos sensíveis e configurações de segurança

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Verificação de Segurança - API Inscrição NestJS${NC}"
echo "=================================================="
echo ""

# Contador de problemas
ISSUES=0
WARNINGS=0

# Função para incrementar contadores
increment_issue() {
    ((ISSUES++))
}

increment_warning() {
    ((WARNINGS++))
}

# 1. Verificar arquivos sensíveis no Git
echo -e "${BLUE}📁 Verificando arquivos sensíveis no Git...${NC}"
SENSITIVE_FILES=$(git ls-files 2>/dev/null | grep -E "\.(env|key|crt|pem|secret|password)$" || true)

if [ -n "$SENSITIVE_FILES" ]; then
    echo -e "${RED}❌ ARQUIVOS SENSÍVEIS ENCONTRADOS NO GIT:${NC}"
    echo "$SENSITIVE_FILES"
    echo -e "${RED}⚠️  REMOVA ESTES ARQUIVOS DO GIT IMEDIATAMENTE!${NC}"
    increment_issue
else
    echo -e "${GREEN}✅ Nenhum arquivo sensível encontrado no Git${NC}"
fi
echo ""

# 2. Verificar se .env existe
echo -e "${BLUE}🔐 Verificando arquivo .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    # Verificar se .env está no .gitignore
    if git check-ignore .env >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Arquivo .env está no .gitignore${NC}"
    else
        echo -e "${RED}❌ Arquivo .env NÃO está no .gitignore${NC}"
        increment_issue
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${BLUE}💡 Execute: cp env.example .env${NC}"
    increment_warning
fi
echo ""

# 3. Verificar credenciais hardcoded
echo -e "${BLUE}🔍 Verificando credenciais hardcoded...${NC}"
# Procurar por strings literais que parecem senhas ou chaves
HARDCODED_CREDS=$(grep -r -E "['\"][a-zA-Z0-9]{20,}['\"]" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "//" | grep -v "import" | grep -v "require" | grep -v "process.env" || true)

if [ -n "$HARDCODED_CREDS" ]; then
    echo -e "${YELLOW}⚠️  Possíveis credenciais hardcoded encontradas:${NC}"
    echo "$HARDCODED_CREDS" | head -5
    if [ $(echo "$HARDCODED_CREDS" | wc -l) -gt 5 ]; then
        echo "... e mais $(($(echo "$HARDCODED_CREDS" | wc -l) - 5)) linhas"
    fi
    increment_warning
else
    echo -e "${GREEN}✅ Nenhuma credencial hardcoded encontrada${NC}"
fi
echo ""

# 4. Verificar dependências vulneráveis
echo -e "${BLUE}📦 Verificando vulnerabilidades nas dependências...${NC}"
if command -v npm >/dev/null 2>&1; then
    VULNERABILITIES=$(npm audit --audit-level=moderate --json 2>/dev/null | grep -c "vulnerabilities" || echo "0")
    
    if [ "$VULNERABILITIES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Vulnerabilidades encontradas nas dependências${NC}"
        echo -e "${BLUE}💡 Execute: npm audit fix${NC}"
        increment_warning
    else
        echo -e "${GREEN}✅ Nenhuma vulnerabilidade crítica encontrada${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npm não encontrado, pulando verificação de vulnerabilidades${NC}"
fi
echo ""

# 5. Verificar configurações Docker
echo -e "${BLUE}🐳 Verificando configurações Docker...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml encontrado${NC}"
    
    # Verificar se roda como não-root
    if grep -q "user:" docker-compose.yml; then
        echo -e "${GREEN}✅ Container configurado para rodar como não-root${NC}"
    else
        echo -e "${YELLOW}⚠️  Container não especifica usuário não-root${NC}"
        increment_warning
    fi
    
    # Verificar limites de recursos
    if grep -q "memory:" docker-compose.yml; then
        echo -e "${GREEN}✅ Limites de memória configurados${NC}"
    else
        echo -e "${YELLOW}⚠️  Limites de memória não configurados${NC}"
        increment_warning
    fi
    
    # Verificar restart policy
    if grep -q "restart:" docker-compose.yml; then
        echo -e "${GREEN}✅ Restart policy configurada${NC}"
    else
        echo -e "${YELLOW}⚠️  Restart policy não configurada${NC}"
        increment_warning
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.yml não encontrado${NC}"
    increment_warning
fi
echo ""

# 6. Verificar permissões de arquivos
echo -e "${BLUE}🔐 Verificando permissões de arquivos...${NC}"
SENSITIVE_PERMS=$(find . -name "*.env*" -o -name "*.key" -o -name "*.pem" -o -name "*.crt" 2>/dev/null | xargs ls -la 2>/dev/null | grep -E "^-rw-rw-rw-|^-rwxrwxrwx" || true)

if [ -n "$SENSITIVE_PERMS" ]; then
    echo -e "${RED}❌ Arquivos sensíveis com permissões muito abertas:${NC}"
    echo "$SENSITIVE_PERMS"
    echo -e "${BLUE}💡 Execute: chmod 600 arquivo_sensivel${NC}"
    increment_issue
else
    echo -e "${GREEN}✅ Permissões de arquivos sensíveis adequadas${NC}"
fi
echo ""

# 7. Verificar configurações de banco de dados
echo -e "${BLUE}🗄️  Verificando configurações de banco de dados...${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ Schema do Prisma encontrado${NC}"
    
    # Verificar se usa SSL
    if grep -q "ssl" prisma/schema.prisma; then
        echo -e "${GREEN}✅ SSL configurado no schema${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL não configurado no schema${NC}"
        increment_warning
    fi
else
    echo -e "${YELLOW}⚠️  Schema do Prisma não encontrado${NC}"
    increment_warning
fi
echo ""

# 8. Verificar logs
echo -e "${BLUE}📋 Verificando configurações de logs...${NC}"
if [ -d "logs" ]; then
    echo -e "${GREEN}✅ Pasta de logs encontrada${NC}"
    
    # Verificar se logs estão no .gitignore
    if git check-ignore logs >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Pasta de logs está no .gitignore${NC}"
    else
        echo -e "${YELLOW}⚠️  Pasta de logs NÃO está no .gitignore${NC}"
        increment_warning
    fi
else
    echo -e "${YELLOW}⚠️  Pasta de logs não encontrada${NC}"
    increment_warning
fi
echo ""

# Resumo
echo "=================================================="
echo -e "${BLUE}📊 RESUMO DA VERIFICAÇÃO DE SEGURANÇA${NC}"
echo "=================================================="

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 EXCELENTE! Nenhum problema de segurança encontrado.${NC}"
    echo -e "${GREEN}✅ Seu projeto está seguindo as boas práticas de segurança.${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: $WARNINGS avisos encontrados.${NC}"
    echo -e "${BLUE}💡 Revise os avisos acima para melhorar a segurança.${NC}"
    exit 0
else
    echo -e "${RED}🚨 PROBLEMAS CRÍTICOS: $ISSUES problemas encontrados.${NC}"
    echo -e "${RED}❌ CORRIJA OS PROBLEMAS ACIMA ANTES DE CONTINUAR.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  E também $WARNINGS avisos para revisar.${NC}"
    fi
    exit 1
fi
