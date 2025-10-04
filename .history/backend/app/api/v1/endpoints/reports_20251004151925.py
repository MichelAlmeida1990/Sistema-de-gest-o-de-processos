# ===========================================
# ENDPOINTS DE RELATÓRIOS
# ===========================================

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.process import Process
from app.models.task import Task
from app.models.file import File

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter estatísticas do dashboard."""
    try:
        # Contar processos
        total_processes = db.query(Process).count()
        active_processes = db.query(Process).filter(Process.status == "active").count()
        
        # Contar tarefas
        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == "completed").count()
        pending_tasks = db.query(Task).filter(Task.status == "todo").count()
        
        # Contar arquivos
        total_files = db.query(File).count()
        
        # Tarefas por status
        tasks_by_status = db.query(
            Task.status,
            func.count(Task.id).label('count')
        ).group_by(Task.status).all()
        
        # Processos por status
        processes_by_status = db.query(
            Process.status,
            func.count(Process.id).label('count')
        ).group_by(Process.status).all()
        
        # Tarefas criadas nos últimos 30 dias
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_tasks = db.query(Task).filter(Task.created_at >= thirty_days_ago).count()
        
        # Processos criados nos últimos 30 dias
        recent_processes = db.query(Process).filter(Process.created_at >= thirty_days_ago).count()
        
        return {
            "processes": {
                "total": total_processes,
                "active": active_processes,
                "by_status": [{"status": status, "count": count} for status, count in processes_by_status]
            },
            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "pending": pending_tasks,
                "by_status": [{"status": status, "count": count} for status, count in tasks_by_status]
            },
            "files": {
                "total": total_files
            },
            "recent": {
                "tasks_30_days": recent_tasks,
                "processes_30_days": recent_processes
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas: {str(e)}"
        )

@router.get("/processes/analytics")
async def get_process_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter análise de processos."""
    try:
        query = db.query(Process)
        
        if start_date:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Process.created_at >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Process.created_at <= end)
        
        processes = query.all()
        
        # Análise por mês
        monthly_data = db.query(
            extract('year', Process.created_at).label('year'),
            extract('month', Process.created_at).label('month'),
            func.count(Process.id).label('count')
        ).group_by(
            extract('year', Process.created_at),
            extract('month', Process.created_at)
        ).all()
        
        # Análise por cliente
        client_data = db.query(
            Process.client_name,
            func.count(Process.id).label('count')
        ).group_by(Process.client_name).all()
        
        return {
            "total": len(processes),
            "monthly": [{"year": int(year), "month": int(month), "count": count} for year, month, count in monthly_data],
            "by_client": [{"client": client, "count": count} for client, count in client_data]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar análise: {str(e)}"
        )

@router.get("/tasks/analytics")
async def get_task_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter análise de tarefas."""
    try:
        query = db.query(Task)
        
        if start_date:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Task.created_at >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Task.created_at <= end)
        
        tasks = query.all()
        
        # Análise por prioridade
        priority_data = db.query(
            Task.priority,
            func.count(Task.id).label('count')
        ).group_by(Task.priority).all()
        
        # Análise por categoria
        category_data = db.query(
            Task.category,
            func.count(Task.id).label('count')
        ).group_by(Task.category).all()
        
        # Tempo médio de conclusão
        completed_tasks = db.query(Task).filter(
            Task.status == "completed",
            Task.completed_at.isnot(None)
        ).all()
        
        avg_completion_time = 0
        if completed_tasks:
            total_time = sum([
                (task.completed_at - task.created_at).total_seconds()
                for task in completed_tasks
                if task.completed_at and task.created_at
            ])
            avg_completion_time = total_time / len(completed_tasks)
        
        return {
            "total": len(tasks),
            "by_priority": [{"priority": priority, "count": count} for priority, count in priority_data],
            "by_category": [{"category": category, "count": count} for category, count in category_data],
            "avg_completion_time_seconds": avg_completion_time
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar análise: {str(e)}"
        )













