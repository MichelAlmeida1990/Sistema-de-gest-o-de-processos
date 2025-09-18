# ===========================================
# MODELO DE PROCESSO
# ===========================================

from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class ProcessStatus(PyEnum):
    """Status do processo."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ProcessPriority(PyEnum):
    """Prioridade do processo."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Process(BaseModel):
    """Modelo de processo jurídico."""
    
    __tablename__ = "processes"
    
    # Informações básicas
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    process_number = Column(String(100), unique=True, index=True, nullable=True)
    client_name = Column(String(255), nullable=False)
    client_document = Column(String(20), nullable=True)
    
    # Status e prioridade
    status = Column(Enum(ProcessStatus), default=ProcessStatus.DRAFT, nullable=False)
    priority = Column(Enum(ProcessPriority), default=ProcessPriority.MEDIUM, nullable=False)
    
    # Datas importantes
    start_date = Column(DateTime(timezone=True), nullable=True)
    expected_end_date = Column(DateTime(timezone=True), nullable=True)
    actual_end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Valores financeiros
    estimated_value = Column(Numeric(15, 2), nullable=True)
    actual_value = Column(Numeric(15, 2), nullable=True)
    currency = Column(String(3), default="BRL", nullable=False)
    
    # Categorização
    category = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # JSON string
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", foreign_keys=[user_id])
    
    tasks = relationship("Task", foreign_keys="Task.process_id")
    files = relationship("File", foreign_keys="File.process_id")
    timeline_events = relationship("TimelineEvent", foreign_keys="TimelineEvent.process_id")
    
    def __repr__(self):
        return f"<Process(id={self.id}, title='{self.title}', status='{self.status.value}')>"
