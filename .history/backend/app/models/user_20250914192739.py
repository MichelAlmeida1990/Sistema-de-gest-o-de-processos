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
    
    # Relacionamentos (simplificados temporariamente)
    # processes = relationship("Process", back_populates="user")
    # assigned_tasks = relationship("Task", back_populates="assigned_user")
    # created_tasks = relationship("Task", back_populates="created_by")
    # timeline_events = relationship("TimelineEvent", back_populates="user")
    # notifications = relationship("Notification", back_populates="user")
    # audit_logs = relationship("AuditLog", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"
