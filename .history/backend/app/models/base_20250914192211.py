# ===========================================
# MODELO BASE
# ===========================================

from sqlalchemy import Column, Integer, DateTime, func
from datetime import datetime

# Importar Base do database.py para usar a mesma instância
from app.core.database import Base

class BaseModel(Base):
    """Modelo base com campos comuns a todos os modelos."""
    
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def to_dict(self):
        """Converter modelo para dicionário."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self):
        """Representação string do modelo."""
        return f"<{self.__class__.__name__}(id={self.id})>"
