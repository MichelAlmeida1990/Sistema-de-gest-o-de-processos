#!/bin/bash

# ===========================================
# SCRIPT PARA PARAR AMBIENTE DE DESENVOLVIMENTO
# ===========================================

echo "🛑 Parando ambiente de desenvolvimento..."

# Parar containers
docker-compose down

echo "✅ Ambiente de desenvolvimento parado com sucesso!"
echo ""
echo "💡 Para iniciar novamente, execute:"
echo "   ./scripts/start-dev.sh"
echo ""


