#!/bin/bash

# ===========================================
# SCRIPT DE CONFIGURAÇÃO INICIAL DO PROJETO
# ===========================================

echo "🔧 Configurando projeto..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker Desktop."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose."
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p uploads
mkdir -p logs
mkdir -p backups
mkdir -p nginx/ssl

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado a partir do exemplo."
else
    echo "ℹ️  Arquivo .env já existe."
fi

# Tornar scripts executáveis
echo "🔐 Tornando scripts executáveis..."
chmod +x scripts/*.sh

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker não está rodando. Por favor, inicie o Docker Desktop."
    echo "   Após iniciar o Docker, execute: ./scripts/start-dev.sh"
    exit 1
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "🚀 Para iniciar o ambiente de desenvolvimento, execute:"
echo "   ./scripts/start-dev.sh"
echo ""
echo "📚 Documentação:"
echo "   README.md - Documentação principal"
echo "   http://localhost:8000/docs - Documentação da API"
echo ""








