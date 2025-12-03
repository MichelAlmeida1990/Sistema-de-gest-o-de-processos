#!/usr/bin/env python3
"""
Seed simplificado para dados do funil de processos.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.funnel import ProcessFunnel, FunnelStage, FunnelStageType
from datetime import datetime

def create_simple_funnel_data():
    """Criar dados básicos do funil."""
    
    db = SessionLocal()
    
    try:
        # Verificar se já existe um funil padrão
        existing_funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.name == "Funil Jurídico Padrão"
        ).first()
        
        if existing_funnel:
            print("Funil padrão já existe. Pulando criação...")
            return
        
        # Criar funil padrão
        default_funnel = ProcessFunnel(
            name="Funil Jurídico Padrão",
            description="Funil padrão para processos jurídicos",
            is_default=True,
            is_active=True
        )
        
        db.add(default_funnel)
        db.commit()
        db.refresh(default_funnel)
        
        print(f"Funil criado: {default_funnel.name} (ID: {default_funnel.id})")
        
        # Criar etapas do funil
        stages_data = [
            {
                "name": "Distribuição",
                "description": "Processo distribuído e aguardando análise inicial",
                "stage_type": FunnelStageType.DISTRIBUICAO,
                "order_position": 1,
                "color": "#3498db"
            },
            {
                "name": "Análise Inicial",
                "description": "Análise inicial dos documentos e preparação da estratégia",
                "stage_type": FunnelStageType.ANALISE_INICIAL,
                "order_position": 2,
                "color": "#e74c3c"
            },
            {
                "name": "Audiência",
                "description": "Aguardando audiência ou sessão",
                "stage_type": FunnelStageType.AUDIENCIA,
                "order_position": 3,
                "color": "#f39c12"
            },
            {
                "name": "Sentença",
                "description": "Aguardando sentença ou decisão judicial",
                "stage_type": FunnelStageType.SENTENCA,
                "order_position": 4,
                "color": "#9b59b6"
            },
            {
                "name": "Execução",
                "description": "Processo em fase de execução",
                "stage_type": FunnelStageType.EXECUCAO,
                "order_position": 5,
                "color": "#27ae60"
            },
            {
                "name": "Arquivado",
                "description": "Processo arquivado ou finalizado",
                "stage_type": FunnelStageType.ARQUIVADO,
                "order_position": 6,
                "color": "#95a5a6"
            }
        ]
        
        for stage_data in stages_data:
            stage = FunnelStage(
                funnel_id=default_funnel.id,
                name=stage_data["name"],
                description=stage_data["description"],
                stage_type=stage_data["stage_type"],
                order_position=stage_data["order_position"],
                color=stage_data["color"],
                is_active=True
            )
            
            db.add(stage)
        
        db.commit()
        
        print("Etapas do funil criadas com sucesso!")
        print(f"Total de etapas criadas: {len(stages_data)}")
        
    except Exception as e:
        print(f"Erro ao criar dados do funil: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Função principal."""
    print("Iniciando seed simplificado dos dados do funil...")
    
    try:
        create_simple_funnel_data()
        print("\nSeed do funil concluído com sucesso!")
        
    except Exception as e:
        print(f"\nErro durante o seed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

