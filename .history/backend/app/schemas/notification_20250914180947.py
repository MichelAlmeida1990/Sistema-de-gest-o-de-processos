# ===========================================
# SCHEMAS DE NOTIFICAÇÃO
# ===========================================

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.models.notification import NotificationType, NotificationStatus
from app.schemas.common import BaseResponse

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
