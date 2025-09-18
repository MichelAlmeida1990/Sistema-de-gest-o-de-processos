# ===========================================
# MODELO DE TIMELINE
# ===========================================

from sqlalchemy import Column, String, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class TimelineEventType(PyEnum):
    """Tipo de evento na timeline."""
    PROCESS_CREATED = "process_created"
    PROCESS_UPDATED = "process_updated"
    PROCESS_COMPLETED = "process_completed"
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    FILE_UPLOADED = "file_uploaded"
    COMMENT_ADDED = "comment_added"
    STATUS_CHANGED = "status_changed"
    USER_LOGIN = "user_login"
    SYSTEM_EVENT = "system_event"

class TimelineEvent(BaseModel):
    """Modelo de evento na timeline."""
    
    __tablename__ = "timeline_events"
    
    # Informações básicas
    event_type = Column(Enum(TimelineEventType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Metadados
    event_data = Column(JSON, nullable=True)  # Dados adicionais do evento
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=True)
    # user = relationship("User", back_populates="timeline_events")
    
    process_id = Column(ForeignKey("processes.id"), nullable=True)
    # process = relationship("Process", back_populates="timeline_events")
    
    task_id = Column(ForeignKey("tasks.id"), nullable=True)
    # task = relationship("Task", back_populates="timeline_events")
    
    def __repr__(self):
        return f"<TimelineEvent(id={self.id}, type='{self.event_type.value}', title='{self.title}')>"
