# ===========================================
# SCRIPT PARA POPULAR DADOS INICIAIS DO FUNIL
# ===========================================

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.funnel import ProcessFunnel, FunnelStage, FunnelStageType
from app.models.process import Process
from datetime import datetime


def create_default_funnel():
    """Criar funil padrão com etapas jurídicas."""
    
    db = SessionLocal()
    try:
        # Verificar se já existe um funil padrão
        existing_funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.is_default == True
        ).first()
        
        if existing_funnel:
            print("Funil padrão já existe. Atualizando...")
            existing_funnel.is_active = False
            db.commit()
        
        # Criar novo funil padrão
        funnel = ProcessFunnel(
            name="Funil Jurídico Padrão",
            description="Funil padrão para gestão de processos jurídicos",
            is_default=True,
            is_active=True
        )
        
        db.add(funnel)
        db.commit()
        db.refresh(funnel)
        
        # Criar etapas do funil
        stages_data = [
            {
                "name": "Distribuição",
                "description": "Processo distribuído e aguardando análise inicial",
                "stage_type": "distribuicao",
                "order_position": 1,
                "color": "#e74c3c"
            },
            {
                "name": "Análise Inicial",
                "description": "Análise inicial dos documentos e estratégia",
                "stage_type": "analise_inicial",
                "order_position": 2,
                "color": "#f39c12"
            },
            {
                "name": "Audiência",
                "description": "Processo em fase de audiência ou instrução",
                "stage_type": "audiencia",
                "order_position": 3,
                "color": "#3498db"
            },
            {
                "name": "Sentença",
                "description": "Aguardando sentença ou decisão judicial",
                "stage_type": "sentenca",
                "order_position": 4,
                "color": "#9b59b6"
            },
            {
                "name": "Execução",
                "description": "Processo em fase de execução",
                "stage_type": "execucao",
                "order_position": 5,
                "color": "#27ae60"
            },
            {
                "name": "Arquivado",
                "description": "Processo arquivado ou finalizado",
                "stage_type": "arquivado",
                "order_position": 6,
                "color": "#95a5a6"
            }
        ]
        
        for stage_data in stages_data:
            stage = FunnelStage(
                funnel_id=funnel.id,
                name=stage_data["name"],
                description=stage_data["description"],
                stage_type=stage_data["stage_type"],
                order_position=stage_data["order_position"],
                color=stage_data["color"],
                is_active=True
            )
            db.add(stage)
        
        db.commit()
        
        print(f"Funil padrao criado com sucesso!")
        print(f"   ID: {funnel.id}")
        print(f"   Nome: {funnel.name}")
        print(f"   Etapas criadas: {len(stages_data)}")
        
        return funnel
        
    except Exception as e:
        print(f"Erro ao criar funil padrao: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_funnel_variants():
    """Criar variações de funis para diferentes tipos de processos."""
    
    db = SessionLocal()
    try:
        # Funil para processos trabalhistas
        labor_funnel = ProcessFunnel(
            name="Funil Trabalhista",
            description="Funil específico para processos trabalhistas",
            is_default=False,
            is_active=True
        )
        
        db.add(labor_funnel)
        db.commit()
        db.refresh(labor_funnel)
        
        # Etapas para processos trabalhistas
        labor_stages = [
            {
                "name": "Distribuição",
                "description": "Processo distribuído na Vara do Trabalho",
                "stage_type": "distribuicao",
                "order_position": 1,
                "color": "#e74c3c"
            },
            {
                "name": "Conciliação",
                "description": "Tentativa de conciliação",
                "stage_type": "analise_inicial",
                "order_position": 2,
                "color": "#f39c12"
            },
            {
                "name": "Instrução",
                "description": "Fase de instrução processual",
                "stage_type": "audiencia",
                "order_position": 3,
                "color": "#3498db"
            },
            {
                "name": "Sentença",
                "description": "Aguardando sentença do juiz",
                "stage_type": "sentenca",
                "order_position": 4,
                "color": "#9b59b6"
            },
            {
                "name": "Execução",
                "description": "Execução da sentença",
                "stage_type": "execucao",
                "order_position": 5,
                "color": "#27ae60"
            },
            {
                "name": "Arquivado",
                "description": "Processo arquivado",
                "stage_type": "arquivado",
                "order_position": 6,
                "color": "#95a5a6"
            }
        ]
        
        for stage_data in labor_stages:
            stage = FunnelStage(
                funnel_id=labor_funnel.id,
                name=stage_data["name"],
                description=stage_data["description"],
                stage_type=stage_data["stage_type"],
                order_position=stage_data["order_position"],
                color=stage_data["color"],
                is_active=True
            )
            db.add(stage)
        
        db.commit()
        
        print(f"Funil Trabalhista criado com sucesso!")
        print(f"   ID: {labor_funnel.id}")
        print(f"   Nome: {labor_funnel.name}")
        
        # Funil para processos cíveis
        civil_funnel = ProcessFunnel(
            name="Funil Cível",
            description="Funil específico para processos cíveis",
            is_default=False,
            is_active=True
        )
        
        db.add(civil_funnel)
        db.commit()
        db.refresh(civil_funnel)
        
        # Etapas para processos cíveis
        civil_stages = [
            {
                "name": "Distribuição",
                "description": "Processo distribuído na Vara Cível",
                "stage_type": "distribuicao",
                "order_position": 1,
                "color": "#e74c3c"
            },
            {
                "name": "Citação",
                "description": "Citação do réu",
                "stage_type": "analise_inicial",
                "order_position": 2,
                "color": "#f39c12"
            },
            {
                "name": "Contestação",
                "description": "Aguardando contestação",
                "stage_type": "audiencia",
                "order_position": 3,
                "color": "#3498db"
            },
            {
                "name": "Instrução",
                "description": "Fase de instrução processual",
                "stage_type": "audiencia",
                "order_position": 4,
                "color": "#9b59b6"
            },
            {
                "name": "Sentença",
                "description": "Aguardando sentença",
                "stage_type": "sentenca",
                "order_position": 5,
                "color": "#27ae60"
            },
            {
                "name": "Execução",
                "description": "Execução da sentença",
                "stage_type": "execucao",
                "order_position": 6,
                "color": "#95a5a6"
            },
            {
                "name": "Arquivado",
                "description": "Processo arquivado",
                "stage_type": "arquivado",
                "order_position": 7,
                "color": "#34495e"
            }
        ]
        
        for stage_data in civil_stages:
            stage = FunnelStage(
                funnel_id=civil_funnel.id,
                name=stage_data["name"],
                description=stage_data["description"],
                stage_type=stage_data["stage_type"],
                order_position=stage_data["order_position"],
                color=stage_data["color"],
                is_active=True
            )
            db.add(stage)
        
        db.commit()
        
        print(f"Funil Civel criado com sucesso!")
        print(f"   ID: {civil_funnel.id}")
        print(f"   Nome: {civil_funnel.name}")
        
    except Exception as e:
        print(f"Erro ao criar funis variantes: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def assign_processes_to_default_funnel():
    """Atribuir processos existentes ao funil padrão."""
    
    db = SessionLocal()
    try:
        # Obter funil padrão
        default_funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.is_default == True,
            ProcessFunnel.is_active == True
        ).first()
        
        if not default_funnel:
            print("Funil padrao nao encontrado")
            return
        
        # Obter primeira etapa do funil
        first_stage = db.query(FunnelStage).filter(
            FunnelStage.funnel_id == default_funnel.id,
            FunnelStage.order_position == 1
        ).first()
        
        if not first_stage:
            print("Primeira etapa do funil nao encontrada")
            return
        
        # Atribuir processos existentes ao funil padrão
        processes = db.query(Process).filter(
            Process.funnel_id.is_(None)
        ).all()
        
        updated_count = 0
        for process in processes:
            process.funnel_id = default_funnel.id
            updated_count += 1
        
        db.commit()
        
        print(f"{updated_count} processos atribuidos ao funil padrao")
        
    except Exception as e:
        print(f"Erro ao atribuir processos ao funil: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Função principal para executar o seed."""
    print("Iniciando seed dos dados do funil...")
    
    try:
        # Criar funil padrão
        create_default_funnel()
        
        # Criar funis variantes
        create_funnel_variants()
        
        # Atribuir processos ao funil padrão
        assign_processes_to_default_funnel()
        
        print("\nSeed do funil concluido com sucesso!")
        
    except Exception as e:
        print(f"\nErro durante o seed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
