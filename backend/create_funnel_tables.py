# ===========================================
# SCRIPT PARA CRIAR TABELAS DO FUNIL
# ===========================================

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_funnel_tables():
    """Criar tabelas do funil no banco de dados."""
    
    # Criar engine
    engine = create_engine(settings.database_url)
    
    # SQL para criar as tabelas
    create_tables_sql = """
    -- Criar tipo ENUM para tipos de etapa
    DO $$ BEGIN
        CREATE TYPE funnelstagetype AS ENUM (
            'distribuicao',
            'analise_inicial', 
            'audiencia',
            'sentenca',
            'execucao',
            'arquivado',
            'cancelado'
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    -- Tabela de funis de processos
    CREATE TABLE IF NOT EXISTS process_funnels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Tabela de etapas do funil
    CREATE TABLE IF NOT EXISTS funnel_stages (
        id SERIAL PRIMARY KEY,
        funnel_id INTEGER NOT NULL REFERENCES process_funnels(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        stage_type funnelstagetype NOT NULL,
        order_position INTEGER NOT NULL DEFAULT 0,
        color VARCHAR(7) DEFAULT '#3498db',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Tabela de etapas dos processos
    CREATE TABLE IF NOT EXISTS process_stages (
        id SERIAL PRIMARY KEY,
        process_id INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
        stage_id INTEGER NOT NULL REFERENCES funnel_stages(id) ON DELETE CASCADE,
        entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        exited_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de transições do funil
    CREATE TABLE IF NOT EXISTS funnel_transitions (
        id SERIAL PRIMARY KEY,
        funnel_id INTEGER NOT NULL REFERENCES process_funnels(id) ON DELETE CASCADE,
        from_stage_id INTEGER NOT NULL REFERENCES funnel_stages(id) ON DELETE CASCADE,
        to_stage_id INTEGER NOT NULL REFERENCES funnel_stages(id) ON DELETE CASCADE,
        is_allowed BOOLEAN DEFAULT TRUE,
        requires_approval BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Adicionar coluna funnel_id na tabela processes se não existir
    ALTER TABLE processes ADD COLUMN IF NOT EXISTS funnel_id INTEGER REFERENCES process_funnels(id);
    
    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_process_funnels_name ON process_funnels(name);
    CREATE INDEX IF NOT EXISTS idx_process_funnels_is_default ON process_funnels(is_default);
    CREATE INDEX IF NOT EXISTS idx_funnel_stages_funnel_id ON funnel_stages(funnel_id);
    CREATE INDEX IF NOT EXISTS idx_funnel_stages_order ON funnel_stages(order_position);
    CREATE INDEX IF NOT EXISTS idx_process_stages_process_id ON process_stages(process_id);
    CREATE INDEX IF NOT EXISTS idx_process_stages_stage_id ON process_stages(stage_id);
    CREATE INDEX IF NOT EXISTS idx_process_stages_entered_at ON process_stages(entered_at);
    CREATE INDEX IF NOT EXISTS idx_processes_funnel_id ON processes(funnel_id);
    """
    
    try:
        with engine.connect() as conn:
            # Executar SQL
            conn.execute(text(create_tables_sql))
            conn.commit()
            
        print("Tabelas do funil criadas com sucesso!")
        return True
        
    except Exception as e:
        print(f"Erro ao criar tabelas do funil: {e}")
        return False

if __name__ == "__main__":
    create_funnel_tables()
