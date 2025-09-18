#!/bin/bash

# Render Build Script para FastAPI
echo "🚀 Iniciando build do backend..."

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações do banco
echo "🗄️ Executando migrações..."
python init_db.py

# Criar usuário admin se não existir
echo "👤 Criando usuário admin..."
python create_admin.py

# Popular dados iniciais se necessário
echo "🌱 Populando dados iniciais..."
python seed_data.py

echo "✅ Build concluído com sucesso!"
