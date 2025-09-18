# ===========================================
# SERVIÇO DE DASHBOARD
# ===========================================

from typing import Dict, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.user import User, UserStatus
from app.models.process import Process, ProcessStatus
from app.models.task import Task, TaskStatus
from app.models.timeline import TimelineEvent

class DashboardService:
    """Serviço para dados do dashboard."""
    
    @staticmethod
    def get_admin_dashboard_data(db: Session) -> Dict[str, Any]:
        """Obter dados reais do dashboard administrativo."""
        
        # Contadores básicos
        total_processes = db.query(Process).count()
        active_processes = db.query(Process).filter(
            Process.status == ProcessStatus.ACTIVE
        ).count()
        
        total_tasks = db.query(Task).count()
        pending_tasks = db.query(Task).filter(
            Task.status == TaskStatus.TODO
        ).count()
        in_progress_tasks = db.query(Task).filter(
            Task.status == TaskStatus.IN_PROGRESS
        ).count()
        completed_tasks = db.query(Task).filter(
            Task.status == TaskStatus.COMPLETED
        ).count()
        
        total_users = db.query(User).count()
        active_users = db.query(User).filter(
            User.status == UserStatus.ACTIVE
        ).count()
        
        # Atividade recente (últimos 30 dias)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_activity = db.query(TimelineEvent).filter(
            TimelineEvent.created_at >= thirty_days_ago
        ).order_by(desc(TimelineEvent.created_at)).limit(10).all()
        
        # Formatear atividades para o frontend
        formatted_activity = []
        for event in recent_activity:
            formatted_activity.append({
                "id": event.id,
                "type": event.event_type,
                "description": event.description,
                "user": event.user.full_name if event.user else "Sistema",
                "timestamp": event.created_at.isoformat()
            })
        
        # Estatísticas de tarefas por status
        task_stats = db.query(
            Task.status,
            func.count(Task.id).label('count')
        ).group_by(Task.status).all()
        
        tasks_by_status = []
        for status, count in task_stats:
            status_map = {
                TaskStatus.TODO: "pendente",
                TaskStatus.IN_PROGRESS: "em_andamento", 
                TaskStatus.REVIEW: "revisao",
                TaskStatus.COMPLETED: "concluida",
                TaskStatus.CANCELLED: "cancelada"
            }
            tasks_by_status.append({
                "status": status_map.get(status, status.value),
                "count": count
            })
        
        # Processos por status
        process_stats = db.query(
            Process.status,
            func.count(Process.id).label('count')
        ).group_by(Process.status).all()
        
        processes_by_status = []
        for status, count in process_stats:
            status_map = {
                ProcessStatus.DRAFT: "rascunho",
                ProcessStatus.ACTIVE: "ativo",
                ProcessStatus.PAUSED: "pausado",
                ProcessStatus.COMPLETED: "concluido",
                ProcessStatus.ARCHIVED: "arquivado"
            }
            processes_by_status.append({
                "status": status_map.get(status, status.value),
                "count": count
            })
        
        # Dados de produtividade (últimos 6 meses)
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        monthly_tasks = db.query(
            func.date_trunc('month', Task.completed_at).label('month'),
            func.count(Task.id).label('count')
        ).filter(
            Task.completed_at >= six_months_ago,
            Task.status == TaskStatus.COMPLETED
        ).group_by(func.date_trunc('month', Task.completed_at)).all()
        
        productivity_data = []
        for month, count in monthly_tasks:
            productivity_data.append({
                "month": month.strftime("%Y-%m") if month else "N/A",
                "completed_tasks": count
            })
        
        return {
            "summary": {
                "total_processes": total_processes,
                "active_processes": active_processes,
                "total_tasks": total_tasks,
                "pending_tasks": pending_tasks,
                "in_progress_tasks": in_progress_tasks,
                "completed_tasks": completed_tasks,
                "total_users": total_users,
                "active_users": active_users
            },
            "recent_activity": formatted_activity,
            "charts": {
                "tasks_by_status": tasks_by_status,
                "processes_by_status": processes_by_status,
                "productivity_by_month": productivity_data
            }
        }
    
    @staticmethod
    def get_user_dashboard_data(db: Session, user_id: int) -> Dict[str, Any]:
        """Obter dados do dashboard do usuário."""
        
        # Tarefas do usuário
        my_tasks = db.query(Task).filter(Task.assigned_user_id == user_id).count()
        my_pending_tasks = db.query(Task).filter(
            Task.assigned_user_id == user_id,
            Task.status == TaskStatus.TODO
        ).count()
        my_in_progress_tasks = db.query(Task).filter(
            Task.assigned_user_id == user_id,
            Task.status == TaskStatus.IN_PROGRESS
        ).count()
        my_completed_tasks = db.query(Task).filter(
            Task.assigned_user_id == user_id,
            Task.status == TaskStatus.COMPLETED
        ).count()
        
        # Processos do usuário
        my_processes = db.query(Process).filter(Process.user_id == user_id).count()
        my_active_processes = db.query(Process).filter(
            Process.user_id == user_id,
            Process.status == ProcessStatus.ACTIVE
        ).count()
        
        # Tarefas próximas do prazo (próximos 7 dias)
        next_week = datetime.utcnow() + timedelta(days=7)
        upcoming_tasks = db.query(Task).filter(
            Task.assigned_user_id == user_id,
            Task.due_date <= next_week,
            Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
        ).order_by(Task.due_date).limit(5).all()
        
        formatted_upcoming = []
        for task in upcoming_tasks:
            formatted_upcoming.append({
                "id": task.id,
                "title": task.title,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "priority": task.priority.value,
                "process_title": task.process.title if task.process else None
            })
        
        return {
            "summary": {
                "my_tasks": my_tasks,
                "my_pending_tasks": my_pending_tasks,
                "my_in_progress_tasks": my_in_progress_tasks,
                "my_completed_tasks": my_completed_tasks,
                "my_processes": my_processes,
                "my_active_processes": my_active_processes
            },
            "upcoming_tasks": formatted_upcoming
        }
    
    @staticmethod
    def get_system_metrics(db: Session) -> Dict[str, Any]:
        """Obter métricas gerais do sistema."""
        
        # Crescimento de usuários (últimos 12 meses)
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)
        monthly_users = db.query(
            func.date_trunc('month', User.created_at).label('month'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= twelve_months_ago
        ).group_by(func.date_trunc('month', User.created_at)).all()
        
        user_growth = []
        for month, count in monthly_users:
            user_growth.append({
                "month": month.strftime("%Y-%m") if month else "N/A",
                "new_users": count
            })
        
        # Distribuição de usuários por role
        user_roles = db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        roles_distribution = []
        for role, count in user_roles:
            role_names = {
                "admin": "Administrador",
                "lawyer": "Advogado",
                "assistant": "Assistente",
                "client": "Cliente"
            }
            roles_distribution.append({
                "role": role_names.get(role.value, role.value),
                "count": count
            })
        
        return {
            "user_growth": user_growth,
            "roles_distribution": roles_distribution,
            "system_health": {
                "database_status": "healthy",
                "api_status": "healthy",
                "last_backup": "2024-01-01T02:00:00Z"  # TODO: implementar backup real
            }
        }
