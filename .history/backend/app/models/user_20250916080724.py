# ===========================================
# MODELO DE USUÁRIO
# ===========================================

from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
import uuid

from .base import BaseModel

class UserRole(PyEnum):
    """Roles de usuário."""
    ADMIN = "admin"
    LAWYER = "lawyer"
    ASSISTANT = "assistant"
    CLIENT = "client"

class UserStatus(PyEnum):
    """Status do usuário."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class User(BaseModel):
    """Modelo de usuário do sistema."""
    
    __tablename__ = "users"
    
    # Informações básicas
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Autenticação
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # 2FA
    totp_secret = Column(String(32), nullable=True)
    is_2fa_enabled = Column(Boolean, default=False, nullable=False)
    
    # Perfil
    role = Column(Enum(UserRole), default=UserRole.LAWYER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Configurações
    timezone = Column(String(50), default="America/Sao_Paulo", nullable=False)
    language = Column(String(10), default="pt-BR", nullable=False)
    
    # Timestamps de autenticação
    last_login = Column(DateTime(timezone=True), nullable=True)
    password_changed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relacionamentos (simplificados - sem back_populates para evitar circular references)
    processes = relationship("Process", foreign_keys="Process.user_id")
    assigned_tasks = relationship("Task", foreign_keys="Task.assigned_user_id")
    created_tasks = relationship("Task", foreign_keys="Task.created_by_id")
    timeline_events = relationship("TimelineEvent", foreign_keys="TimelineEvent.user_id")
    notifications = relationship("Notification", foreign_keys="Notification.user_id")
    audit_logs = relationship("AuditLog", foreign_keys="AuditLog.user_id")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"
