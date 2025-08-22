#!/bin/bash

# Script para gerenciar a aplicação com Docker Compose
# Simula um ambiente Heroku Eco Dyno

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}Docker Compose Manager - API Inscrição NestJS${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  build     - Constrói a imagem Docker otimizada"
    echo "  up        - Inicia a aplicação"
    echo "  down      - Para e remove a aplicação"
    echo "  restart   - Reinicia a aplicação"
    echo "  logs      - Mostra os logs da aplicação"
    echo "  status    - Mostra o status dos containers"
    echo "  clean     - Remove containers, volumes e imagens"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 build && $0 up    # Constrói e inicia"
    echo "  $0 logs -f          # Mostra logs em tempo real"
    echo ""
}

# Função para verificar se o .env existe
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
        echo -e "${BLUE}📝 Copiando env.example para .env...${NC}"
        cp env.example .env
        echo -e "${YELLOW}⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar.${NC}"
        echo -e "${BLUE}🔧 Variáveis obrigatórias:${NC}"
        echo "   - DATABASE_URL"
        echo "   - JWT_AUTH_SECRECT"
        echo "   - JWT_REFRESH_SECRET"
        exit 1
    fi
}

# Função para construir a imagem
build_image() {
    echo -e "${BLUE}🏗️  Construindo imagem Docker otimizada...${NC}"
    docker build -f Dockerfile.optimized -t api-inscricao-nest:optimized .
    echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
}

# Função para iniciar a aplicação
start_app() {
    echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Aplicação iniciada!${NC}"
    echo -e "${BLUE}🌐 Acesse: http://localhost:3000${NC}"
    echo -e "${BLUE}📊 Status: $0 status${NC}"
    echo -e "${BLUE}📋 Logs: $0 logs${NC}"
}

# Função para parar a aplicação
stop_app() {
    echo -e "${BLUE}🛑 Parando aplicação...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Aplicação parada!${NC}"
}

# Função para reiniciar a aplicação
restart_app() {
    echo -e "${BLUE}🔄 Reiniciando aplicação...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Aplicação reiniciada!${NC}"
}

# Função para mostrar logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs da aplicação...${NC}"
    docker-compose logs "$@"
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}📊 Status dos containers:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}💾 Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
}

# Função para limpar tudo
clean_all() {
    echo -e "${YELLOW}⚠️  Tem certeza que deseja remover tudo? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}🧹 Limpando containers, volumes e imagens...${NC}"
        docker-compose down -v --rmi all
        docker system prune -f
        echo -e "${GREEN}✅ Limpeza concluída!${NC}"
    else
        echo -e "${BLUE}❌ Limpeza cancelada.${NC}"
    fi
}

# Função para verificar recursos
check_resources() {
    echo -e "${BLUE}🔍 Verificando recursos do sistema...${NC}"
    
    # Verificar memória disponível
    total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    
    echo -e "${BLUE}💾 Memória:${NC}"
    echo "   Total: ${total_mem}MB"
    echo "   Disponível: ${available_mem}MB"
    
    if [ "$available_mem" -lt 512 ]; then
        echo -e "${YELLOW}⚠️  Memória disponível menor que 512MB (Heroku Eco Dyno)${NC}"
    else
        echo -e "${GREEN}✅ Memória suficiente${NC}"
    fi
    
    # Verificar CPU
    cpu_cores=$(nproc)
    echo -e "${BLUE}🖥️  CPU:${NC}"
    echo "   Cores disponíveis: $cpu_cores"
    echo -e "${GREEN}✅ CPU suficiente${NC}"
}

# Main script
case "${1:-help}" in
    build)
        build_image
        ;;
    up)
        check_env
        start_app
        ;;
    down)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs "${@:2}"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    resources)
        check_resources
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando inválido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
