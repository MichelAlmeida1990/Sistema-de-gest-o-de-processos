#!/usr/bin/env python3
# ===========================================
# SCRIPT PARA POPULAR BANCO COM DADOS INICIAIS
# ===========================================

import sys
import os
from datetime import datetime, timedelta
import random

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User, UserRole, UserStatus
from app.models.process import Process, ProcessStatus, ProcessPriority
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.timeline import TimelineEvent, TimelineEventType
from app.services.auth import AuthService

def create_sample_data():
    """Criar dados de exemplo."""
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem dados
        if db.query(User).count() > 0:
            print("Dados já existem no banco. Pulando criação...")
            return
        
        print("Criando dados de exemplo...")
        
        # 1. Criar usuários
        users_data = [
            {
                "email": "admin@sistema.com",
                "username": "admin",
                "full_name": "Administrador do Sistema",
                "role": UserRole.ADMIN,
                "phone": "(11) 99999-0001"
            },
            {
                "email": "joao.advogado@escritorio.com",
                "username": "joao.advogado",
                "full_name": "João Silva Advogado",
                "role": UserRole.LAWYER,
                "phone": "(11) 99999-0002"
            },
            {
                "email": "maria.calculista@escritorio.com",
                "username": "maria.calculista",
                "full_name": "Maria Santos Calculista",
                "role": UserRole.ASSISTANT,
                "phone": "(11) 99999-0003"
            },
            {
                "email": "carlos.cliente@email.com",
                "username": "carlos.cliente",
                "full_name": "Carlos Lima Cliente",
                "role": UserRole.CLIENT,
                "phone": "(11) 99999-0004"
            },
            {
                "email": "ana.assistente@escritorio.com",
                "username": "ana.assistente",
                "full_name": "Ana Costa Assistente",
                "role": UserRole.ASSISTANT,
                "phone": "(11) 99999-0005"
            }
        ]
        
        users = []
        for user_data in users_data:
            hashed_password = AuthService.get_password_hash("123456")
            user = User(
                **user_data,
                hashed_password=hashed_password,
                is_active=True,
                is_verified=True,
                status=UserStatus.ACTIVE,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Criados {len(users)} usuários")
        
        # 2. Criar processos com dados mais detalhados e realistas
        processes_data = [
            {
                "title": "Ação Trabalhista - Rescisão Indireta por Justa Causa",
                "description": "Processo trabalhista onde o empregado alega rescisão indireta por justa causa do empregador. O cliente trabalhou por 8 anos na empresa e foi demitido sem justa causa, alegando que a empresa cometeu diversas irregularidades trabalhistas como não pagamento de horas extras, não fornecimento de equipamentos de proteção individual, e assédio moral. A ação busca o pagamento de verbas rescisórias em dobro, multa do artigo 477 da CLT, FGTS com multa de 40%, e indenização por danos morais.",
                "process_number": "1001234-56.2024.8.26.0001",
                "client_name": "João Silva Santos",
                "client_document": "123.456.789-00",
                "status": ProcessStatus.ACTIVE,
                "priority": ProcessPriority.HIGH,
                "category": "Trabalhista",
                "estimated_value": 45000.00,
                "tags": '["rescisão indireta", "justa causa", "verbas rescisórias", "FGTS", "danos morais"]'
            },
            {
                "title": "Processo Criminal - Furto Qualificado - Defesa",
                "description": "Defesa em processo criminal por furto qualificado. O cliente foi acusado de furtar mercadorias no valor de R$ 2.500,00 de uma loja de departamentos. A defesa alega que o cliente estava sob efeito de medicamentos que afetam o discernimento, possui histórico de transtorno bipolar com laudo psiquiátrico, e que o valor da mercadoria não caracteriza furto qualificado. A estratégia de defesa inclui pedido de reconhecimento de inimputabilidade, redução da pena pelo valor da coisa furtada, e possível acordo de suspensão condicional do processo.",
                "process_number": "2001234-56.2024.8.26.0002",
                "client_name": "Maria Santos Lima",
                "client_document": "987.654.321-00",
                "status": ProcessStatus.COMPLETED,
                "priority": ProcessPriority.URGENT,
                "category": "Criminal",
                "estimated_value": 25000.00,
                "actual_value": 22000.00,
                "tags": '["furto qualificado", "defesa criminal", "inimputabilidade", "transtorno bipolar", "suspensão condicional"]'
            },
            {
                "title": "Ação Civil - Indenização por Danos Morais e Materiais",
                "description": "Ação de indenização por danos morais e materiais decorrentes de acidente de trânsito. O cliente foi vítima de atropelamento em cruzamento sinalizado, sofrendo fratura exposta na perna esquerda, múltiplas escoriações e trauma psicológico. O acusado estava dirigindo embriagado (alcoolemia de 1.2 mg/l) e fugiu do local. A ação busca indenização por danos morais (R$ 30.000,00), danos materiais (gastos médicos e fisioterapia - R$ 15.000,00), lucros cessantes durante período de afastamento (R$ 8.000,00) e danos estéticos. O processo inclui perícia médica e perícia em documentos.",
                "process_number": "3001234-56.2024.8.26.0003",
                "client_name": "Carlos Lima Costa",
                "client_document": "456.789.123-00",
                "status": ProcessStatus.ACTIVE,
                "priority": ProcessPriority.MEDIUM,
                "category": "Civil",
                "estimated_value": 65000.00,
                "tags": '["danos morais", "danos materiais", "acidente trânsito", "embriaguez", "perícia médica", "lucros cessantes"]'
            },
            {
                "title": "Divórcio Consensual com Partilha de Bens",
                "description": "Processo de divórcio consensual com partilha de bens do regime de comunhão parcial. O casal foi casado por 12 anos e possui um filho menor de idade. Os bens a serem partilhados incluem: apartamento residencial avaliado em R$ 450.000,00, veículo Honda Civic 2018 avaliado em R$ 85.000,00, conta corrente conjunta com saldo de R$ 25.000,00, e aplicações financeiras no valor de R$ 40.000,00. O processo inclui acordo de pensão alimentícia para o menor no valor de R$ 1.200,00 mensais, regulamentação de visitas, e guarda compartilhada. Há também discussão sobre a pensão compensatória.",
                "process_number": "4001234-56.2024.8.26.0004",
                "client_name": "Ana Costa Silva",
                "client_document": "789.123.456-00",
                "status": ProcessStatus.PAUSED,
                "priority": ProcessPriority.LOW,
                "category": "Família",
                "estimated_value": 15000.00,
                "tags": '["divórcio consensual", "partilha de bens", "pensão alimentícia", "guarda compartilhada", "regulamentação visitas"]'
            },
            {
                "title": "Revisão de Aposentadoria por Tempo de Contribuição",
                "description": "Processo administrativo e judicial para revisão de aposentadoria por tempo de contribuição. O cliente possui 35 anos de contribuição comprovada, mas o INSS negou o benefício alegando falta de documentação de períodos de trabalho rural e trabalho informal. A ação busca o reconhecimento de períodos não computados incluindo: 8 anos de trabalho rural na agricultura familiar (1985-1993), 3 anos de trabalho informal como autônomo (1995-1998), e 2 anos de trabalho doméstico (2000-2002). O processo inclui produção de testemunhas, documentação rural, declarações de terceiros, e perícia técnica para comprovação dos períodos.",
                "process_number": "5001234-56.2024.8.26.0005",
                "client_name": "Pedro Oliveira Santos",
                "client_document": "321.654.987-00",
                "status": ProcessStatus.DRAFT,
                "priority": ProcessPriority.MEDIUM,
                "category": "Previdenciário",
                "estimated_value": 55000.00,
                "tags": '["aposentadoria", "tempo contribuição", "trabalho rural", "trabalho informal", "INSS", "revisão administrativa"]'
            },
            {
                "title": "Ação de Cobrança - Contrato de Prestação de Serviços",
                "description": "Ação de cobrança decorrente de contrato de prestação de serviços de consultoria empresarial. O cliente prestou serviços de consultoria em gestão de qualidade e processos organizacionais para uma empresa de médio porte durante 6 meses. O contrato previa pagamento mensal de R$ 15.000,00, totalizando R$ 90.000,00, mas a empresa pagou apenas os primeiros 3 meses (R$ 45.000,00), deixando de pagar os últimos 3 meses. A ação busca o pagamento da dívida de R$ 45.000,00, juros de mora de 1% ao mês, correção monetária, multa contratual de 10%, e honorários advocatícios. Há produção de provas documentais e testemunhais.",
                "process_number": "6001234-56.2024.8.26.0006",
                "client_name": "Roberto Almeida Mendes",
                "client_document": "654.321.987-00",
                "status": ProcessStatus.ACTIVE,
                "priority": ProcessPriority.HIGH,
                "category": "Civil",
                "estimated_value": 52000.00,
                "tags": '["cobrança", "contrato prestação serviços", "consultoria", "juros mora", "multa contratual"]'
            }
        ]
        
        processes = []
        for i, process_data in enumerate(processes_data):
            # Associar processo a um advogado
            lawyer = next((u for u in users if u.role == UserRole.LAWYER), users[0])
            
            process = Process(
                **process_data,
                user_id=lawyer.id,
                start_date=datetime.utcnow() - timedelta(days=random.randint(1, 180)),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 200))
            )
            
            # Definir data de conclusão para processos concluídos
            if process.status == ProcessStatus.COMPLETED:
                process.actual_end_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            
            db.add(process)
            processes.append(process)
        
        db.commit()
        print(f"✅ Criados {len(processes)} processos")
        
        # 3. Criar tarefas
        task_templates = [
            "Elaborar petição inicial",
            "Análise de documentos",
            "Cálculo de verbas rescisórias",
            "Preparar defesa",
            "Audiência de conciliação",
            "Perícia técnica",
            "Elaborar recurso",
            "Análise jurisprudencial",
            "Reunião com cliente",
            "Protocolo de documentos"
        ]
        
        tasks = []
        for process in processes:
            # Criar 2-4 tarefas por processo
            num_tasks = random.randint(2, 4)
            for i in range(num_tasks):
                task_title = random.choice(task_templates)
                
                # Escolher usuário aleatório (assistente ou advogado)
                assignee = random.choice([u for u in users if u.role in [UserRole.LAWYER, UserRole.ASSISTANT]])
                creator = next((u for u in users if u.role == UserRole.LAWYER), users[0])
                
                status_choices = list(TaskStatus)
                status = random.choice(status_choices)
                
                task = Task(
                    title=f"{task_title} - {process.title[:30]}",
                    description=f"Tarefa relacionada ao processo {process.process_number}",
                    status=status,
                    priority=random.choice(list(TaskPriority)),
                    process_id=process.id,
                    assigned_user_id=assignee.id,
                    created_by_id=creator.id,
                    category=process.category,
                    estimated_hours=random.randint(2, 16),
                    progress_percentage=random.randint(0, 100) if status != TaskStatus.TODO else 0,
                    due_date=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 100))
                )
                
                # Definir data de conclusão para tarefas concluídas
                if status == TaskStatus.COMPLETED:
                    task.completed_at = datetime.utcnow() - timedelta(days=random.randint(1, 60))
                    task.progress_percentage = 100
                    task.actual_hours = random.randint(task.estimated_hours - 2, task.estimated_hours + 4)
                
                db.add(task)
                tasks.append(task)
        
        db.commit()
        print(f"✅ Criadas {len(tasks)} tarefas")
        
        # 4. Criar eventos de timeline
        events = []
        event_types = [
            ("process_created", "Processo criado"),
            ("task_created", "Tarefa criada"),
            ("task_completed", "Tarefa concluída"),
            ("file_uploaded", "Documento enviado"),
            ("status_changed", "Status alterado"),
            ("comment_added", "Comentário adicionado")
        ]
        
        # Eventos para processos
        for process in processes:
            for i in range(random.randint(3, 8)):
                event_type, description_template = random.choice(event_types)
                
                event = TimelineEvent(
                    event_type=event_type,
                    title=f"Evento no processo {process.process_number[:10]}",
                    description=f"{description_template} no processo {process.title}",
                    process_id=process.id,
                    user_id=process.user_id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 150))
                )
                
                db.add(event)
                events.append(event)
        
        # Eventos para tarefas
        for task in tasks:
            if random.random() < 0.7:  # 70% das tarefas têm eventos
                event_type, description_template = random.choice(event_types)
                
                event = TimelineEvent(
                    event_type=event_type,
                    title=f"Evento na tarefa {task.title[:20]}",
                    description=f"{description_template}: {task.title}",
                    task_id=task.id,
                    process_id=task.process_id,
                    user_id=task.assigned_user_id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
                )
                
                db.add(event)
                events.append(event)
        
        db.commit()
        print(f"✅ Criados {len(events)} eventos de timeline")
        
        print("\n🎉 Dados de exemplo criados com sucesso!")
        print("\n👤 Usuários criados:")
        print("- admin@sistema.com (senha: 123456) - Admin")
        print("- joao.advogado@escritorio.com (senha: 123456) - Advogado")  
        print("- maria.calculista@escritorio.com (senha: 123456) - Assistente")
        print("- carlos.cliente@email.com (senha: 123456) - Cliente")
        print("- ana.assistente@escritorio.com (senha: 123456) - Assistente")
        
    except Exception as e:
        print(f"❌ Erro ao criar dados: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
