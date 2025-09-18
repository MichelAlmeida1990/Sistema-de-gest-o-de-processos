# ===========================================
# SCHEMAS DE NOTIFICAÇÃO
# ===========================================

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.models.notification import NotificationType, NotificationStatus
from app.schemas.common import BaseResponse

class NotificationCreate(BaseModel):
    """Schema para criação de notificação."""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=1000)
    notification_type: NotificationType = NotificationType.INFO
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    related_id: Optional[int] = None
    related_type: Optional[str] = None

class NotificationUpdate(BaseModel):
    """Schema para atualização de notificação."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1, max_length=1000)
    status: Optional[NotificationStatus] = None

class NotificationResponse(BaseResponse):
    """Schema para resposta de notificação."""
    title: str
    message: str
    notification_type: NotificationType
    status: NotificationStatus
    action_url: Optional[str]
    action_text: Optional[str]
    read_at: Optional[datetime]
    expires_at: Optional[datetime]
    user_id: int

class NotificationList(BaseModel):
    """Schema para lista de notificações."""
    notifications: list[NotificationResponse]
    total: int
    page: int
    per_page: int





