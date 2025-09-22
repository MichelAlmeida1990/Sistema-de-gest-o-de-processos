# ===========================================
# SCHEMAS COMUNS
# ===========================================

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar('T')

class MessageResponse(BaseModel):
    """Schema para mensagens de resposta."""
    message: str
    success: bool = True
    data: Optional[Any] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Schema para respostas paginadas."""
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool

class BaseResponse(BaseModel):
    """Schema base para respostas."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    """Schema para respostas de erro."""
    error: str
    message: str
    details: Optional[Any] = None
    status_code: int = 400

class HealthResponse(BaseModel):
    """Schema para resposta de health check."""
    status: str
    database: str
    redis: str
    timestamp: float
    version: str
    environment: str






