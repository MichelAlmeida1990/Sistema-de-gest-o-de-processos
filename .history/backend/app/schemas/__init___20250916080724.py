# ===========================================
# SCHEMAS PYDANTIC
# ===========================================

from .user import UserCreate, UserUpdate, UserResponse, UserLogin, UserProfile
from .process import ProcessCreate, ProcessUpdate, ProcessResponse, ProcessList
from .task import TaskCreate, TaskUpdate, TaskResponse, TaskList
from .file import FileCreate, FileResponse, FileList
from .timeline import TimelineEventResponse, TimelineEventList
from .notification import NotificationResponse, NotificationList
from .auth import Token, TokenData, LoginResponse
from .common import MessageResponse, PaginatedResponse

__all__ = [
    # User schemas
    "UserCreate",
    "UserUpdate", 
    "UserResponse",
    "UserLogin",
    "UserProfile",
    
    # Process schemas
    "ProcessCreate",
    "ProcessUpdate",
    "ProcessResponse",
    "ProcessList",
    
    # Task schemas
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskList",
    
    # File schemas
    "FileCreate",
    "FileResponse",
    "FileList",
    
    # Timeline schemas
    "TimelineEventResponse",
    "TimelineEventList",
    
    # Notification schemas
    "NotificationResponse",
    "NotificationList",
    
    # Auth schemas
    "Token",
    "TokenData",
    "LoginResponse",
    
    # Common schemas
    "MessageResponse",
    "PaginatedResponse"
]

