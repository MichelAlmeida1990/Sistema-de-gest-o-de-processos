# ===========================================
# SERVIÇO DE TAREFA
# ===========================================

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    """Serviço para gerenciar tarefas."""
    
    @staticmethod
    def create_task(db: Session, task_data: TaskCreate, created_by_id: int) -> Task:
        """Criar nova tarefa."""
        task = Task(
            **task_data.dict(),
            created_by_id=created_by_id
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        return task
    
    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        """Obter tarefa por ID."""
        return db.query(Task).filter(Task.id == task_id).first()
    
    @staticmethod
    def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> List[Task]:
        """Obter lista de tarefas."""
        return db.query(Task).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_user_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
        """Obter tarefas de um usuário."""
        return db.query(Task).filter(Task.assigned_user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """Atualizar tarefa."""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return None
        
        update_data = task_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        db.commit()
        db.refresh(task)
        
        return task
    
    @staticmethod
    def delete_task(db: Session, task_id: int) -> bool:
        """Deletar tarefa."""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return False
        
        db.delete(task)
        db.commit()
        
        return True





