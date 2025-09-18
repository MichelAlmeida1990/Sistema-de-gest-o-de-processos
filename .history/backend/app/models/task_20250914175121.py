# ===========================================
# MODELO DE TAREFA
# ===========================================

from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class TaskStatus(PyEnum):
    """Status da tarefa."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(PyEnum):
    """Prioridade da tarefa."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Task(BaseModel):
    """Modelo de tarefa."""
    
    __tablename__ = "tasks"
    
    # Informações básicas
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Status e prioridade
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    
    # Datas
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Progresso
    progress_percentage = Column(Integer, default=0, nullable=False)
    estimated_hours = Column(Integer, nullable=True)
    actual_hours = Column(Integer, nullable=True)
    
    # Categorização
    category = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # JSON string
    
    # Relacionamentos
    process_id = Column(ForeignKey("processes.id"), nullable=True)
    process = relationship("Process", back_populates="tasks")
    
    assigned_user_id = Column(ForeignKey("users.id"), nullable=True)
    assigned_user = relationship("User", back_populates="tasks")
    
    created_by_id = Column(ForeignKey("users.id"), nullable=False)
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    # Relacionamentos
    timeline_events = relationship("TimelineEvent", back_populates="task")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status.value}')>"
