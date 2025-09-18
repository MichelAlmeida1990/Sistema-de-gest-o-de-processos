# ===========================================
# MODELO DE AUDITORIA
# ===========================================

from sqlalchemy import Column, String, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class AuditAction(PyEnum):
    """Ações auditadas."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    DOWNLOAD = "download"
    UPLOAD = "upload"

class AuditLog(BaseModel):
    """Modelo de log de auditoria."""
    
    __tablename__ = "audit_logs"
    
    # Informações básicas
    action = Column(Enum(AuditAction), nullable=False)
    resource_type = Column(String(100), nullable=False)  # process, task, user, etc.
    resource_id = Column(String(100), nullable=True)
    
    # Detalhes
    description = Column(Text, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Metadados
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action.value}', resource='{self.resource_type}')>"
