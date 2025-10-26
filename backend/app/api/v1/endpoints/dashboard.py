# ===========================================
# ENDPOINTS DASHBOARD
# ===========================================

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.process import Process, ProcessStatus
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.models.timeline import TimelineEvent

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/test")
async def test_dashboard():
    """Endpoint de teste sem autenticação."""
    return {
        "message": "Dashboard endpoint funcionando",
        "timestamp": "2024-01-01T12:00:00Z"
    }


@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Obter estatísticas gerais do dashboard baseado em dados reais."""
    try:
        # Total de processos
        total_processes = db.query(func.count(Process.id)).scalar()
        
        # Processos ativos
        active_processes = db.query(func.count(Process.id)).filter(
            Process.status == ProcessStatus.ACTIVE
        ).scalar()
        
        # Tarefas concluídas
        completed_tasks = db.query(func.count(Task.id)).filter(
            Task.status == TaskStatus.COMPLETED
        ).scalar()
        
        # Tempo médio de processos (em dias)
        avg_process_time = db.query(
            func.avg(
                func.extract('epoch', Process.updated_at - Process.created_at) / 86400
            )
        ).filter(
            Process.status == ProcessStatus.COMPLETED
        ).scalar()
        average_time = float(avg_process_time) if avg_process_time else 0.0
        
        # Receita total
        total_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            Process.actual_value.isnot(None)
        ).scalar()
        total_revenue = float(total_revenue) if total_revenue else 0.0
        
        # Tarefas pendentes
        pending_tasks = db.query(func.count(Task.id)).filter(
            Task.status == TaskStatus.TODO
        ).scalar()
        
        # Tarefas atrasadas (vencidas)
        overdue_tasks = db.query(func.count(Task.id)).filter(
            and_(
                Task.due_date < datetime.now(),
                Task.status != TaskStatus.COMPLETED
            )
        ).scalar()
        
        # Membros da equipe
        team_members = db.query(func.count(User.id)).filter(
            User.role != UserRole.ADMIN
        ).scalar()
        
        return {
            "totalProcesses": total_processes,
            "activeProcesses": active_processes,
            "completedTasks": completed_tasks,
            "averageTime": round(average_time, 1),
            "totalRevenue": total_revenue,
            "pendingTasks": pending_tasks,
            "overdueTasks": overdue_tasks,
            "teamMembers": team_members
        }
    except Exception as e:
        logger.error(f"Erro ao calcular estatísticas do dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Obter atividades recentes baseado em dados reais."""
    try:
        # Buscar eventos recentes da timeline
        recent_events = db.query(TimelineEvent).order_by(
            TimelineEvent.created_at.desc()
        ).limit(limit).all()
        
        activities = []
        for event in recent_events:
            # Mapear tipo do evento para ícone
            event_type_map = {
                'process': 'process',
                'task': 'task',
                'financial': 'payment',
                'notification': 'notification'
            }
            
            # Mapear status para cor
            status_map = {
                'success': 'success',
                'warning': 'warning',
                'error': 'error',
                'info': 'info'
            }
            
            activities.append({
                "id": event.id,
                "type": event_type_map.get(event.event_type, 'notification'),
                "title": event.title,
                "description": event.description,
                "user": event.user or "Sistema",
                "timestamp": event.created_at.isoformat(),
                "status": status_map.get(event.status, 'info')
            })
        
        return activities
    except Exception as e:
        logger.error(f"Erro ao buscar atividades recentes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/processes")
async def get_process_summary(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Obter resumo de processos baseado em dados reais."""
    try:
        processes = db.query(Process).order_by(
            Process.updated_at.desc()
        ).limit(limit).all()
        
        result = []
        for process in processes:
            result.append({
                "id": process.id,
                "title": process.title,
                "clientName": process.client_name,
                "status": process.status.value,
                "priority": process.priority.value,
                "value": float(process.actual_value) if process.actual_value else 0.0,
                "createdAt": process.created_at.isoformat(),
                "updatedAt": process.updated_at.isoformat()
            })
        
        return result
    except Exception as e:
        logger.error(f"Erro ao buscar resumo de processos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/tasks")
async def get_task_summary(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Obter resumo de tarefas baseado em dados reais."""
    try:
        tasks = db.query(Task).order_by(
            Task.updated_at.desc()
        ).limit(limit).all()
        
        result = []
        for task in tasks:
            result.append({
                "id": task.id,
                "title": task.title,
                "processTitle": task.process.title if task.process else "Sem processo",
                "status": task.status.value,
                "priority": task.priority.value,
                "dueDate": task.due_date.isoformat() if task.due_date else None,
                "assignedTo": task.assigned_user.email if task.assigned_user else "Não atribuído",
                "createdAt": task.created_at.isoformat()
            })
        
        return result
    except Exception as e:
        logger.error(f"Erro ao buscar resumo de tarefas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/performance")
async def get_performance_metrics(db: Session = Depends(get_db)):
    """Obter métricas de performance baseado em dados reais."""
    try:
        # Taxa de conclusão de processos
        total_processes = db.query(func.count(Process.id)).scalar()
        completed_processes = db.query(func.count(Process.id)).filter(
            Process.status == ProcessStatus.COMPLETED
        ).scalar()
        process_completion_rate = (completed_processes / total_processes * 100) if total_processes > 0 else 0
        
        # Taxa de conclusão de tarefas
        total_tasks = db.query(func.count(Task.id)).scalar()
        completed_tasks = db.query(func.count(Task.id)).filter(
            Task.status == TaskStatus.COMPLETED
        ).scalar()
        task_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Tempo médio de processo
        avg_process_time = db.query(
            func.avg(
                func.extract('epoch', Process.updated_at - Process.created_at) / 86400
            )
        ).filter(
            Process.status == ProcessStatus.COMPLETED
        ).scalar()
        average_process_time = float(avg_process_time) if avg_process_time else 0.0
        
        # Tempo médio de tarefa
        avg_task_time = db.query(
            func.avg(
                func.extract('epoch', Task.completed_at - Task.created_at) / 86400
            )
        ).filter(
            Task.status == TaskStatus.COMPLETED,
            Task.completed_at.isnot(None)
        ).scalar()
        average_task_time = float(avg_task_time) if avg_task_time else 0.0
        
        # Crescimento de receita (últimos 30 dias vs mês anterior)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        sixty_days_ago = datetime.now() - timedelta(days=60)
        
        current_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= thirty_days_ago
            )
        ).scalar()
        
        previous_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= sixty_days_ago,
                Process.updated_at < thirty_days_ago
            )
        ).scalar()
        
        revenue_growth = 0.0
        if previous_revenue and previous_revenue > 0:
            revenue_growth = ((float(current_revenue) - float(previous_revenue)) / float(previous_revenue)) * 100
        
        # Satisfação do cliente (simulado baseado em processos completados)
        client_satisfaction = min(95, max(70, process_completion_rate + 10))
        
        return {
            "processCompletionRate": round(process_completion_rate, 1),
            "taskCompletionRate": round(task_completion_rate, 1),
            "averageProcessTime": round(average_process_time, 1),
            "averageTaskTime": round(average_task_time, 1),
            "revenueGrowth": round(revenue_growth, 1),
            "clientSatisfaction": round(client_satisfaction, 1)
        }
    except Exception as e:
        logger.error(f"Erro ao calcular métricas de performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/alerts")
async def get_alerts(db: Session = Depends(get_db)):
    """Obter alertas baseado em dados reais."""
    try:
        # Tarefas urgentes (alta prioridade e próximas do vencimento)
        urgent_tasks = db.query(func.count(Task.id)).filter(
            and_(
                Task.priority == 'urgent',
                Task.due_date <= datetime.now() + timedelta(days=1),
                Task.status != TaskStatus.COMPLETED
            )
        ).scalar() or 0
        
        # Tarefas atrasadas
        overdue_tasks = db.query(func.count(Task.id)).filter(
            and_(
                Task.due_date < datetime.now(),
                Task.status != TaskStatus.COMPLETED
            )
        ).scalar() or 0
        
        # Processos próximos do vencimento
        warning_processes = db.query(func.count(Process.id)).filter(
            and_(
                Process.expected_end_date <= datetime.now() + timedelta(days=7),
                Process.status == ProcessStatus.ACTIVE
            )
        ).scalar() or 0
        
        # Notificações não lidas (simulado - sem consulta complexa)
        unread_notifications = 0
        
        return {
            "urgent": urgent_tasks,
            "warnings": overdue_tasks + warning_processes,
            "info": unread_notifications,
            "total": urgent_tasks + overdue_tasks + warning_processes + unread_notifications
        }
    except Exception as e:
        logger.error(f"Erro ao calcular alertas: {e}")
        # Retornar dados padrão em caso de erro
        return {
            "urgent": 0,
            "warnings": 0,
            "info": 0,
            "total": 0
        }
