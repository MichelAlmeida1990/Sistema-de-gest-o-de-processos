# ===========================================
# ENDPOINTS DE TIMELINE
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.timeline import TimelineEventResponse, TimelineEventList
from app.services.timeline import TimelineService

router = APIRouter()

@router.get("/", response_model=TimelineEventList)
async def get_timeline(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter timeline geral."""
    try:
        events = TimelineService.get_events(db, skip, limit)
        total = len(events)
        
        return TimelineEventList(
            events=events,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar timeline: {str(e)}"
        )

@router.get("/user", response_model=TimelineEventList)
async def get_user_timeline(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter timeline do usuário atual."""
    try:
        events = TimelineService.get_user_events(db, current_user.id, skip, limit)
        total = len(events)
        
        return TimelineEventList(
            events=events,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar timeline: {str(e)}"
        )

@router.get("/process/{process_id}", response_model=TimelineEventList)
async def get_process_timeline(
    process_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter timeline de um processo."""
    try:
        events = TimelineService.get_process_events(db, process_id, skip, limit)
        total = len(events)
        
        return TimelineEventList(
            events=events,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar timeline: {str(e)}"
        )

@router.get("/task/{task_id}", response_model=TimelineEventList)
async def get_task_timeline(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter timeline de uma tarefa."""
    try:
        events = TimelineService.get_task_events(db, task_id, skip, limit)
        total = len(events)
        
        return TimelineEventList(
            events=events,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar timeline: {str(e)}"
        )






