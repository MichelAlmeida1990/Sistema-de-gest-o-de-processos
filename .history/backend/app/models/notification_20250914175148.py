# ===========================================
# MODELO DE NOTIFICAÇÃO
# ===========================================

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class NotificationType(PyEnum):
    """Tipo de notificação."""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    TASK_ASSIGNED = "task_assigned"
    TASK_DUE = "task_due"
    PROCESS_UPDATED = "process_updated"
    FILE_UPLOADED = "file_uploaded"
    SYSTEM_MAINTENANCE = "system_maintenance"

class NotificationStatus(PyEnum):
    """Status da notificação."""
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

class Notification(BaseModel):
    """Modelo de notificação."""
    
    __tablename__ = "notifications"
    
    # Informações básicas
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.UNREAD, nullable=False)
    
    # Ação
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(100), nullable=True)
    
    # Timestamps
    read_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type='{self.notification_type.value}', status='{self.status.value}')>"
