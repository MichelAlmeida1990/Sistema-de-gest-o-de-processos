# ===========================================
# ENDPOINTS DE INTEGRAÇÃO DATAJUD
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.datajud import datajud_service

router = APIRouter()

@router.get("/status")
async def get_datajud_status(
    current_user: User = Depends(get_current_user)
):
    """Verificar status da API DataJud."""
    try:
        status_info = await datajud_service.check_api_status()
        return status_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao verificar status da API DataJud: {str(e)}"
        )

@router.get("/process/{process_number}")
async def search_process(
    process_number: str,
    current_user: User = Depends(get_current_user)
):
    """Buscar processo pelo número na API DataJud."""
    try:
        # Validar número do processo
        if not datajud_service.validate_process_number(process_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de processo inválido"
            )
        
        process_data = await datajud_service.search_process_by_number(process_number)
        
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado na base DataJud"
            )
        
        return {
            "success": True,
            "data": process_data,
            "formatted_number": datajud_service.format_process_number(process_number)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processo: {str(e)}"
        )

@router.get("/process/{process_number}/movements")
async def get_process_movements(
    process_number: str,
    start_date: Optional[date] = Query(None, description="Data inicial para busca de movimentações"),
    current_user: User = Depends(get_current_user)
):
    """Obter movimentações de um processo."""
    try:
        if not datajud_service.validate_process_number(process_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de processo inválido"
            )
        
        movements = await datajud_service.get_process_movements(process_number, start_date)
        
        return {
            "success": True,
            "process_number": datajud_service.format_process_number(process_number),
            "movements": movements,
            "total": len(movements)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar movimentações: {str(e)}"
        )

@router.get("/search/document/{document}")
async def search_processes_by_document(
    document: str,
    current_user: User = Depends(get_current_user)
):
    """Buscar processos por CPF/CNPJ."""
    try:
        # Validar documento básico
        clean_doc = ''.join(filter(str.isdigit, document))
        if len(clean_doc) not in [11, 14]:  # CPF ou CNPJ
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)"
            )
        
        processes = await datajud_service.search_processes_by_cpf_cnpj(document)
        
        return {
            "success": True,
            "document": document,
            "processes": processes,
            "total": len(processes)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos por documento: {str(e)}"
        )

@router.get("/tribunal/{tribunal_code}")
async def get_tribunal_info(
    tribunal_code: str,
    current_user: User = Depends(get_current_user)
):
    """Obter informações de um tribunal."""
    try:
        tribunal_info = await datajud_service.get_tribunal_info(tribunal_code)
        
        if not tribunal_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tribunal não encontrado"
            )
        
        return {
            "success": True,
            "tribunal": tribunal_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tribunal: {str(e)}"
        )

@router.get("/tables/classes")
async def get_process_classes(
    current_user: User = Depends(get_current_user)
):
    """Obter tabela de classes processuais."""
    try:
        classes = await datajud_service.get_process_classes()
        
        return {
            "success": True,
            "classes": classes,
            "total": len(classes)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar classes processuais: {str(e)}"
        )

@router.get("/tables/subjects")
async def get_process_subjects(
    current_user: User = Depends(get_current_user)
):
    """Obter tabela de assuntos processuais."""
    try:
        subjects = await datajud_service.get_process_subjects()
        
        return {
            "success": True,
            "subjects": subjects,
            "total": len(subjects)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar assuntos processuais: {str(e)}"
        )

@router.post("/validate/process-number")
async def validate_process_number(
    process_number: str,
    current_user: User = Depends(get_current_user)
):
    """Validar número de processo pelo algoritmo CNJ."""
    try:
        is_valid = datajud_service.validate_process_number(process_number)
        formatted = datajud_service.format_process_number(process_number) if is_valid else None
        
        return {
            "process_number": process_number,
            "is_valid": is_valid,
            "formatted": formatted,
            "message": "Número válido" if is_valid else "Número inválido"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar número: {str(e)}"
        )
