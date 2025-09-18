#!/usr/bin/env python3
"""
Script para criar as tabelas do banco de dados.
"""

from app.core.database import engine, Base
from app.models import *  # Importa todos os modelos

def create_tables():
    """Criar todas as tabelas."""
    print("🔄 Criando tabelas do banco de dados...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        raise

if __name__ == "__main__":
    create_tables()
