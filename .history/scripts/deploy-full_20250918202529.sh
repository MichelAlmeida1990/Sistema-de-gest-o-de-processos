#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY COMPLETO
# ===========================================

echo "🚀 Deploy Completo do Sistema de Gestão de Processos"
echo "======================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    log_error "Execute este script na raiz do projeto"
    exit 1
fi

# Fase 1: Preparação
log_info "Fase 1: Preparação do projeto"
echo "--------------------------------"

# Verificar Git
if [ ! -d ".git" ]; then
    log_warning "Repositório Git não encontrado. Inicializando..."
    git init
    git add .
    git commit -m "feat: sistema pronto para deploy"
    log_success "Repositório Git inicializado"
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Há mudanças não commitadas. Fazendo commit..."
    git add .
    git commit -m "feat: preparar para deploy"
    log_success "Mudanças commitadas"
fi

# Fase 2: Build do Frontend
log_info "Fase 2: Build do frontend"
echo "----------------------------"

cd frontend

# Verificar dependências
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências do frontend..."
    npm install
fi

# Fazer build
log_info "Fazendo build para produção..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Build do frontend falhou!"
    exit 1
fi

log_success "Build do frontend concluído!"

# Fase 3: Verificações de Segurança
log_info "Fase 3: Verificações de segurança"
echo "------------------------------------"

cd ..

# Verificar se chaves foram geradas
if [ ! -f ".env.production.keys" ]; then
    log_warning "Chaves de produção não encontradas. Gerando..."
    cd scripts
    python generate-keys.py
    cd ..
    log_success "Chaves de produção geradas"
fi

# Verificar .gitignore
if ! grep -q ".env.production.keys" .gitignore; then
    echo ".env.production.keys" >> .gitignore
    log_success "Arquivo de chaves adicionado ao .gitignore"
fi

# Fase 4: Instruções de Deploy
log_info "Fase 4: Instruções de deploy"
echo "------------------------------"

echo ""
log_success "✅ Projeto preparado para deploy!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "🔸 FRONTEND (Vercel):"
echo "   1. Acesse: https://vercel.com"
echo "   2. New Project → Import Git Repository"
echo "   3. Selecione seu repositório"
echo "   4. Configure:"
echo "      - Framework: Vite"
echo "      - Root Directory: frontend"
echo "      - Build Command: npm run build"
echo "      - Output Directory: dist"
echo ""
echo "🔸 BACKEND (Railway):"
echo "   1. Acesse: https://railway.app"
echo "   2. New Project → Deploy from GitHub"
echo "   3. Selecione seu repositório"
echo "   4. Configure Root Directory: backend"
echo "   5. Adicione PostgreSQL e Redis"
echo ""
echo "🔸 VARIÁVEIS DE AMBIENTE:"
echo "   📄 Chaves geradas em: .env.production.keys"
echo "   📋 Use essas chaves nas configurações do Railway/Vercel"
echo ""
echo "🔸 CONFIGURAÇÃO FINAL:"
echo "   1. Copie URL do backend do Railway"
echo "   2. Configure VITE_API_URL na Vercel"
echo "   3. Configure FRONTEND_URL no Railway"
echo "   4. Configure ALLOWED_HOSTS no Railway"
echo ""

# Mostrar URLs importantes
echo "🔗 LINKS ÚTEIS:"
echo "   📖 Guia detalhado: DEPLOY_VERCEL.md"
echo "   📖 Documentação: README.md"
echo "   🔧 Configurações: env.example"
echo ""

log_success "🎉 Sistema pronto para deploy em produção!"

# Fase 5: Opcional - Auto deploy se CLI estiver instalado
echo ""
read -p "🤖 Quer fazer deploy automático agora? (y/N): " auto_deploy

if [[ $auto_deploy =~ ^[Yy]$ ]]; then
    log_info "Iniciando deploy automático..."
    
    # Verificar Vercel CLI
    if command -v vercel &> /dev/null; then
        log_info "Fazendo deploy na Vercel..."
        cd frontend
        vercel --prod
        cd ..
        log_success "Frontend deployado na Vercel!"
    else
        log_warning "Vercel CLI não encontrado. Instale com: npm install -g vercel"
    fi
    
    log_info "Para o backend, acesse: https://railway.app"
fi

echo ""
log_success "🏁 Script de deploy concluído!"
