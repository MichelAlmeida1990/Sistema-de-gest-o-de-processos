#!/bin/bash

# ===========================================
# SCRIPT PARA INICIAR AMBIENTE DE DESENVOLVIMENTO
# ===========================================

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do exemplo..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "📊 Verificando status dos serviços..."

# Verificar PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL: OK"
else
    echo "❌ PostgreSQL: FALHOU"
fi

# Verificar Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: FALHOU"
fi

# Verificar Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FALHOU"
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FALHOU"
fi

echo ""
echo "🎉 Ambiente de desenvolvimento iniciado!"
echo ""
echo "📱 Acesse a aplicação:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🗄️  Bancos de dados:"
echo "   PostgreSQL: localhost:5432"
echo "   Redis:      localhost:6379"
echo ""
echo "📋 Comandos úteis:"
echo "   docker-compose logs -f backend    # Ver logs do backend"
echo "   docker-compose logs -f frontend   # Ver logs do frontend"
echo "   docker-compose down               # Parar todos os serviços"
echo "   docker-compose restart backend    # Reiniciar backend"
echo ""














