# ===========================================
# ENDPOINTS DE TAREFAS
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskList
from app.services.task import TaskService

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar nova tarefa."""
    try:
        task = TaskService.create_task(db, task_data, current_user.id)
        return task
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar tarefa: {str(e)}"
        )

@router.get("/", response_model=TaskList)
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter lista de tarefas."""
    try:
        tasks = TaskService.get_tasks(db, skip, limit)
        total = len(tasks)
        
        return TaskList(
            tasks=tasks,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tarefas: {str(e)}"
        )

@router.get("/my", response_model=TaskList)
async def get_my_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter tarefas do usuário atual."""
    try:
        tasks = TaskService.get_user_tasks(db, current_user.id, skip, limit)
        total = len(tasks)
        
        return TaskList(
            tasks=tasks,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tarefas: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter tarefa por ID."""
    try:
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarefa não encontrada"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tarefa: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar tarefa."""
    try:
        task = TaskService.update_task(db, task_id, task_data)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarefa não encontrada"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao atualizar tarefa: {str(e)}"
        )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar tarefa."""
    try:
        success = TaskService.delete_task(db, task_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarefa não encontrada"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar tarefa: {str(e)}"
        )