# ===========================================
# SERVIÇO DE TIMELINE
# ===========================================

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.timeline import TimelineEvent, TimelineEventType

class TimelineService:
    """Serviço para gerenciar timeline."""
    
    @staticmethod
    def create_event(
        db: Session,
        event_type: TimelineEventType,
        title: str,
        description: Optional[str] = None,
        user_id: Optional[int] = None,
        process_id: Optional[int] = None,
        task_id: Optional[int] = None,
        event_data: Optional[Dict[str, Any]] = None
    ) -> TimelineEvent:
        """Criar novo evento na timeline."""
        event = TimelineEvent(
            event_type=event_type,
            title=title,
            description=description,
            user_id=user_id,
            process_id=process_id,
            task_id=task_id,
            event_data=event_data
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        return event
    
    @staticmethod
    def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[TimelineEvent]:
        """Obter eventos da timeline."""
        return db.query(TimelineEvent).order_by(TimelineEvent.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_user_events(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[TimelineEvent]:
        """Obter eventos de um usuário."""
        return db.query(TimelineEvent).filter(TimelineEvent.user_id == user_id).order_by(TimelineEvent.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_process_events(db: Session, process_id: int, skip: int = 0, limit: int = 100) -> List[TimelineEvent]:
        """Obter eventos de um processo."""
        return db.query(TimelineEvent).filter(TimelineEvent.process_id == process_id).order_by(TimelineEvent.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_task_events(db: Session, task_id: int, skip: int = 0, limit: int = 100) -> List[TimelineEvent]:
        """Obter eventos de uma tarefa."""
        return db.query(TimelineEvent).filter(TimelineEvent.task_id == task_id).order_by(TimelineEvent.created_at.desc()).offset(skip).limit(limit).all()







