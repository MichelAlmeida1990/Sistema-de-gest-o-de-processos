#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY PARA VERCEL
# ===========================================

echo "🚀 Preparando deploy do frontend na Vercel..."

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Ir para o diretório frontend
cd frontend

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Configurando projeto para produção..."

# Fazer build local para testar
echo "🏗️ Testando build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local. Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✅ Build local bem-sucedido!"

# Fazer deploy
echo "🚀 Fazendo deploy na Vercel..."
vercel --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente na Vercel:"
echo "   - VITE_API_URL: URL da sua API em produção"
echo "   - VITE_WS_URL: URL do WebSocket em produção"
echo "   - VITE_DEBUG: false"
echo ""
echo "2. Configure domínio personalizado (opcional)"
echo ""
echo "3. Configure backend em produção (Heroku/Railway/DigitalOcean)"
echo ""

# Voltar ao diretório raiz
cd ..

echo "🎉 Frontend deployado com sucesso na Vercel!"
