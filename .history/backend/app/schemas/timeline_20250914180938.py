# ===========================================
# SCHEMAS DE TIMELINE
# ===========================================

from typing import Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.models.timeline import TimelineEventType
from app.schemas.common import BaseResponse

class TimelineEventResponse(BaseResponse):
    """Schema para resposta de evento na timeline."""
    event_type: TimelineEventType
    title: str
    description: Optional[str]
    event_data: Optional[dict[str, Any]]
    user_id: Optional[int]
    process_id: Optional[int]
    task_id: Optional[int]

class TimelineEventList(BaseModel):
    """Schema para lista de eventos da timeline."""
    events: list[TimelineEventResponse]
    total: int
    page: int
    per_page: int
