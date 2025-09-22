#!/bin/bash

echo "🚀 Configurando Railway para deploy..."

# Instalar Railway CLI (se não estiver instalado)
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Login no Railway
echo "🔐 Fazendo login no Railway..."
railway login

# Criar novo projeto
echo "🏗️ Criando projeto no Railway..."
railway init

# Adicionar variáveis de ambiente
echo "⚙️ Configurando variáveis de ambiente..."
railway variables set ENVIRONMENT=production
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set CORS_ORIGINS=https://your-frontend-domain.railway.app

# Adicionar PostgreSQL
echo "🗄️ Adicionando PostgreSQL..."
railway add postgresql

# Adicionar Redis
echo "🔴 Adicionando Redis..."
railway add redis

# Deploy
echo "🚀 Fazendo deploy..."
railway up

echo "✅ Deploy concluído!"
echo "🌐 Seu app estará disponível em: https://your-app.railway.app"
