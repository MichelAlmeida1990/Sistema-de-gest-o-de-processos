# ===========================================
# SERVIÇO DE NOTIFICAÇÕES
# ===========================================

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType, NotificationStatus
from app.models.user import User
from app.schemas.notification import NotificationCreate
from app.api.v1.endpoints.websocket import send_notification_to_user

class NotificationService:
    """Serviço para gerenciar notificações."""
    
    @staticmethod
    def create_notification(
        db: Session, 
        user_id: int, 
        title: str, 
        message: str, 
        notification_type: NotificationType = NotificationType.INFO,
        related_id: Optional[int] = None,
        related_type: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        """Criar nova notificação."""
        
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            status=NotificationStatus.UNREAD,
            related_id=related_id,
            related_type=related_type,
            action_url=action_url
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    async def create_and_send_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        related_id: Optional[int] = None,
        related_type: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        """Criar notificação e enviar via WebSocket."""
        
        # Criar notificação no banco
        notification = NotificationService.create_notification(
            db, user_id, title, message, notification_type, 
            related_id, related_type, action_url
        )
        
        # Enviar via WebSocket
        try:
            await send_notification_to_user(user_id, {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "type": notification.notification_type.value,
                "status": notification.status.value,
                "related_id": notification.related_id,
                "related_type": notification.related_type,
                "action_url": notification.action_url,
                "created_at": notification.created_at.isoformat()
            })
        except Exception as e:
            print(f"Erro ao enviar notificação via WebSocket: {e}")
        
        return notification
    
    @staticmethod
    def get_user_notifications(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        unread_only: bool = False
    ) -> List[Notification]:
        """Obter notificações do usuário."""
        
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.status == NotificationStatus.UNREAD)
        
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
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
        """Marcar todas as notificações do usuário como lidas."""
        
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.status == NotificationStatus.UNREAD
        ).update({
            "status": NotificationStatus.READ,
            "read_at": datetime.utcnow()
        })
        
        db.commit()
        return updated
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Deletar notificação."""
        
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        db.delete(notification)
        db.commit()
        return True
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Obter contagem de notificações não lidas."""
        
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.status == NotificationStatus.UNREAD
        ).count()
    
    @staticmethod
    async def notify_task_assigned(
        db: Session,
        assigned_user_id: int,
        task_title: str,
        task_id: int,
        assigner_name: str
    ):
        """Notificar usuário sobre tarefa atribuída."""
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=assigned_user_id,
            title="Nova Tarefa Atribuída",
            message=f"{assigner_name} atribuiu a tarefa '{task_title}' para você.",
            notification_type=NotificationType.TASK,
            related_id=task_id,
            related_type="task",
            action_url=f"/tasks/{task_id}"
        )
    
    @staticmethod
    async def notify_task_completed(
        db: Session,
        creator_user_id: int,
        task_title: str,
        task_id: int,
        completer_name: str
    ):
        """Notificar criador sobre tarefa concluída."""
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=creator_user_id,
            title="Tarefa Concluída",
            message=f"{completer_name} concluiu a tarefa '{task_title}'.",
            notification_type=NotificationType.SUCCESS,
            related_id=task_id,
            related_type="task",
            action_url=f"/tasks/{task_id}"
        )
    
    @staticmethod
    async def notify_process_status_changed(
        db: Session,
        user_id: int,
        process_title: str,
        process_id: int,
        old_status: str,
        new_status: str
    ):
        """Notificar sobre mudança de status do processo."""
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=user_id,
            title="Status do Processo Alterado",
            message=f"O processo '{process_title}' mudou de '{old_status}' para '{new_status}'.",
            notification_type=NotificationType.INFO,
            related_id=process_id,
            related_type="process",
            action_url=f"/processes/{process_id}"
        )
    
    @staticmethod
    async def notify_file_uploaded(
        db: Session,
        user_id: int,
        file_name: str,
        process_title: str,
        process_id: int,
        uploader_name: str
    ):
        """Notificar sobre upload de arquivo."""
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=user_id,
            title="Novo Arquivo Adicionado",
            message=f"{uploader_name} adicionou o arquivo '{file_name}' ao processo '{process_title}'.",
            notification_type=NotificationType.INFO,
            related_id=process_id,
            related_type="process",
            action_url=f"/processes/{process_id}/files"
        )
    
    @staticmethod
    async def notify_deadline_approaching(
        db: Session,
        user_id: int,
        task_title: str,
        task_id: int,
        days_remaining: int
    ):
        """Notificar sobre prazo se aproximando."""
        
        message = f"A tarefa '{task_title}' vence em {days_remaining} dia(s)."
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=user_id,
            title="Prazo se Aproximando",
            message=message,
            notification_type=NotificationType.WARNING,
            related_id=task_id,
            related_type="task",
            action_url=f"/tasks/{task_id}"
        )
    
    @staticmethod
    async def notify_deadline_overdue(
        db: Session,
        user_id: int,
        task_title: str,
        task_id: int,
        days_overdue: int
    ):
        """Notificar sobre prazo vencido."""
        
        message = f"A tarefa '{task_title}' está atrasada há {days_overdue} dia(s)."
        
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=user_id,
            title="Prazo Vencido",
            message=message,
            notification_type=NotificationType.ERROR,
            related_id=task_id,
            related_type="task",
            action_url=f"/tasks/{task_id}"
        )
    
    @staticmethod
    async def notify_system_maintenance(
        db: Session,
        message: str,
        scheduled_time: Optional[datetime] = None
    ):
        """Notificar todos os usuários sobre manutenção do sistema."""
        
        # Buscar todos os usuários ativos
        users = db.query(User).filter(User.is_active == True).all()
        
        for user in users:
            title = "Manutenção do Sistema"
            if scheduled_time:
                message += f" Agendada para: {scheduled_time.strftime('%d/%m/%Y %H:%M')}"
            
            await NotificationService.create_and_send_notification(
                db=db,
                user_id=user.id,
                title=title,
                message=message,
                notification_type=NotificationType.WARNING
            )