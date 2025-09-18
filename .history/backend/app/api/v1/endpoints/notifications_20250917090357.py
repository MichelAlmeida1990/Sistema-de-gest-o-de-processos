# ===========================================
# ENDPOINTS DE NOTIFICAÇÕES
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationList
from app.services.notification import NotificationService

router = APIRouter()

@router.get("/", response_model=NotificationList)
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter notificações do usuário atual."""
    try:
        notifications = NotificationService.get_user_notifications(db, current_user.id, skip, limit)
        total = len(notifications)
        
        return NotificationList(
            notifications=notifications,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar notificações: {str(e)}"
        )

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter notificação por ID."""
    try:
        notifications = NotificationService.get_user_notifications(db, current_user.id, 0, 1000)
        notification = next((n for n in notifications if n.id == notification_id), None)
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificação não encontrada"
            )
        
        return notification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar notificação: {str(e)}"
        )

@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marcar notificação como lida."""
    try:
        success = NotificationService.mark_as_read(db, notification_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificação não encontrada"
            )
        
        return {"message": "Notificação marcada como lida"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao marcar notificação: {str(e)}"
        )

@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marcar todas as notificações como lidas."""
    try:
        count = NotificationService.mark_all_as_read(db, current_user.id)
        return {"message": f"{count} notificações marcadas como lidas"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao marcar notificações: {str(e)}"
        )



