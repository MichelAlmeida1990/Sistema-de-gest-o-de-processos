# ===========================================
# SCHEMAS DE PROCESSO
# ===========================================

from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from enum import Enum

from app.models.process import ProcessStatus, ProcessPriority
from app.schemas.user import UserResponse
from app.schemas.common import BaseResponse

class ProcessCreate(BaseModel):
    """Schema para criação de processo."""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    process_number: Optional[str] = Field(None, max_length=100)
    client_name: str = Field(..., min_length=2, max_length=255)
    client_document: Optional[str] = Field(None, max_length=20)
    status: ProcessStatus = ProcessStatus.DRAFT
    priority: ProcessPriority = ProcessPriority.MEDIUM
    start_date: Optional[datetime] = None
    expected_end_date: Optional[datetime] = None
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="BRL", max_length=3)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None

class ProcessUpdate(BaseModel):
    """Schema para atualização de processo."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    process_number: Optional[str] = Field(None, max_length=100)
    client_name: Optional[str] = Field(None, min_length=2, max_length=255)
    client_document: Optional[str] = Field(None, max_length=20)
    status: Optional[ProcessStatus] = None
    priority: Optional[ProcessPriority] = None
    start_date: Optional[datetime] = None
    expected_end_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    actual_value: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None

class ProcessResponse(BaseResponse):
    """Schema para resposta de processo."""
    title: str
    description: Optional[str]
    process_number: Optional[str]
    client_name: str
    client_document: Optional[str]
    status: ProcessStatus
    priority: ProcessPriority
    start_date: Optional[datetime]
    expected_end_date: Optional[datetime]
    actual_end_date: Optional[datetime]
    estimated_value: Optional[Decimal]
    actual_value: Optional[Decimal]
    currency: str
    category: Optional[str]
    tags: Optional[str]
    user_id: int
    user: Optional[UserResponse] = None

class ProcessList(BaseModel):
    """Schema para lista de processos."""
    processes: List[ProcessResponse]
    total: int
    page: int
    per_page: int

class ProcessStats(BaseModel):
    """Schema para estatísticas de processos."""
    total: int
    active: int
    completed: int
    paused: int
    draft: int
    total_value: Decimal
    average_value: Decimal





