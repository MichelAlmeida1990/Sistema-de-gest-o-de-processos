#!/usr/bin/env python3
"""
Script para criar as tabelas do banco de dados.
"""

import asyncio
from app.core.database import engine, Base
from app.models import *  # Importa todos os modelos

async def create_tables():
    """Criar todas as tabelas."""
    print("🔄 Criando tabelas do banco de dados...")
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_tables())
