# ===========================================
# SERVIÇOS DA APLICAÇÃO
# ===========================================

from .auth import AuthService
from .user import UserService
from .process import ProcessService
from .task import TaskService
from .file import FileService
from .notification import NotificationService
from .timeline import TimelineService

__all__ = [
    "AuthService",
    "UserService",
    "ProcessService",
    "TaskService",
    "FileService",
    "NotificationService",
    "TimelineService"
]









