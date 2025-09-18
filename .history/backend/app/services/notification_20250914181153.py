# ===========================================
# SERVIÇO DE NOTIFICAÇÃO
# ===========================================

from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType, NotificationStatus

class NotificationService:
    """Serviço para gerenciar notificações."""
    
    @staticmethod
    def create_notification(
        db: Session, 
        user_id: int, 
        title: str, 
        message: str, 
        notification_type: NotificationType,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None
    ) -> Notification:
        """Criar nova notificação."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            action_url=action_url,
            action_text=action_text
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Obter notificações de um usuário."""
        return db.query(Notification).filter(Notification.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """Marcar notificação como lida."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        notification.status = NotificationStatus.READ
        notification.read_at = datetime.utcnow()
        
        db.commit()
        
        return True
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Marcar todas as notificações como lidas."""
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.status == NotificationStatus.UNREAD
        ).update({
            Notification.status: NotificationStatus.READ,
            Notification.read_at: datetime.utcnow()
        })
        
        db.commit()
        
        return count
