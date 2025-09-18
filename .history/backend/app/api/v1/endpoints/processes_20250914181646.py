# ===========================================
# ENDPOINTS DE PROCESSOS
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.process import ProcessCreate, ProcessUpdate, ProcessResponse, ProcessList
from app.services.process import ProcessService

router = APIRouter()

@router.post("/", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def create_process(
    process_data: ProcessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar novo processo."""
    try:
        process = ProcessService.create_process(db, process_data, current_user.id)
        return process
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar processo: {str(e)}"
        )

@router.get("/", response_model=ProcessList)
async def get_processes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter lista de processos."""
    try:
        if search:
            processes = ProcessService.search_processes(db, search, skip, limit)
        else:
            processes = ProcessService.get_processes(db, skip, limit)
        
        total = len(processes)
        
        return ProcessList(
            processes=processes,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos: {str(e)}"
        )

@router.get("/my", response_model=ProcessList)
async def get_my_processes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter processos do usuário atual."""
    try:
        processes = ProcessService.get_user_processes(db, current_user.id, skip, limit)
        total = len(processes)
        
        return ProcessList(
            processes=processes,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos: {str(e)}"
        )

@router.get("/{process_id}", response_model=ProcessResponse)
async def get_process(
    process_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter processo por ID."""
    try:
        process = ProcessService.get_process_by_id(db, process_id)
        if not process:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
        return process
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processo: {str(e)}"
        )

@router.put("/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: int,
    process_data: ProcessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar processo."""
    try:
        process = ProcessService.update_process(db, process_id, process_data)
        if not process:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
        return process
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao atualizar processo: {str(e)}"
        )

@router.delete("/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(
    process_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar processo."""
    try:
        success = ProcessService.delete_process(db, process_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar processo: {str(e)}"
        )