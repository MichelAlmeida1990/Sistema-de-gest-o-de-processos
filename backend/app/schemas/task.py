# ===========================================
# SCHEMAS DE TAREFA
# ===========================================

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum

from app.models.task import TaskStatus, TaskPriority
from app.schemas.common import BaseResponse

class TaskCreate(BaseModel):
    """Schema para criação de tarefa."""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None
    process_id: Optional[int] = None
    assigned_user_id: Optional[int] = None

class TaskUpdate(BaseModel):
    """Schema para atualização de tarefa."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    estimated_hours: Optional[int] = Field(None, ge=0)
    actual_hours: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None
    assigned_user_id: Optional[int] = None

class TaskResponse(BaseResponse):
    """Schema para resposta de tarefa."""
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    progress_percentage: int
    estimated_hours: Optional[int]
    actual_hours: Optional[int]
    category: Optional[str]
    tags: Optional[str]
    process_id: Optional[int]
    assigned_user_id: Optional[int]
    created_by_id: int

class TaskList(BaseModel):
    """Schema para lista de tarefas."""
    tasks: list[TaskResponse]
    total: int
    page: int
    per_page: int







