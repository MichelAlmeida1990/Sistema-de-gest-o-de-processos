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

@router.get("/test")
async def test_processes_endpoint():
    """Endpoint de teste simples."""
    return {
        "message": "Endpoint de processos funcionando",
        "timestamp": "2024-01-01T12:00:00Z",
        "processes": [
            {
                "id": 1,
                "title": "Processo de Teste",
                "client_name": "Cliente Teste",
                "status": "active"
            }
        ]
    }

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

@router.get("/")
async def get_processes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter lista de processos."""
    try:
        # Versão simplificada para debug
        if search:
            processes = ProcessService.search_processes(db, search, skip, limit)
        else:
            processes = ProcessService.get_processes(db, skip, limit)
        
        # Converter para dicionário simples para evitar problemas de serialização
        processes_data = []
        for process in processes:
            processes_data.append({
                "id": process.id,
                "title": process.title,
                "description": process.description,
                "process_number": process.process_number,
                "client_name": process.client_name,
                "client_document": process.client_document,
                "status": process.status.value if process.status else "draft",
                "priority": process.priority.value if process.priority else "medium",
                "estimated_value": float(process.estimated_value) if process.estimated_value else None,
                "actual_value": float(process.actual_value) if process.actual_value else None,
                "start_date": process.start_date.isoformat() if process.start_date else None,
                "expected_end_date": process.expected_end_date.isoformat() if process.expected_end_date else None,
                "actual_end_date": process.actual_end_date.isoformat() if process.actual_end_date else None,
                "category": process.category,
                "tags": process.tags,
                "user_id": process.user_id,
                "created_at": process.created_at.isoformat() if process.created_at else None,
                "updated_at": process.updated_at.isoformat() if process.updated_at else None
            })
        
        total = len(processes)
        
        return {
            "processes": processes_data,
            "total": total,
            "page": skip // limit + 1,
            "per_page": limit
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
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