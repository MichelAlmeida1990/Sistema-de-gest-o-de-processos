#!/bin/bash

# Render Start Script para FastAPI
echo "🚀 Iniciando servidor FastAPI..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definida"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ Erro: SECRET_KEY não está definida"
    exit 1
fi

echo "✅ Variáveis de ambiente verificadas"

# Iniciar servidor
echo "🌐 Iniciando servidor na porta $PORT..."
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
