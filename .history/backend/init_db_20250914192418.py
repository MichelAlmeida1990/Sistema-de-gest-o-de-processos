#!/usr/bin/env python3
"""
Script para inicializar o banco de dados.
"""

from app.core.database import engine, Base, create_tables
from app.models import *  # Importa todos os modelos

def init_db():
    """Inicializar banco de dados."""
    print("🔄 Inicializando banco de dados...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Banco de dados inicializado com sucesso!")
        print("📋 Tabelas criadas:")
        for table in Base.metadata.tables:
            print(f"   - {table}")
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        raise

if __name__ == "__main__":
    init_db()
