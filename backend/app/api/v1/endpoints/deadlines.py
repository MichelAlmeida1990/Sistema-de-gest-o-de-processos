# ===========================================
# ENDPOINTS DE CÁLCULO DE PRAZOS PROCESSUAIS
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.deadline_calculator import deadline_calculator
from sqlalchemy.orm import Session

router = APIRouter()


# ===========================================
# SCHEMAS
# ===========================================

class DeadlineCalculationRequest(BaseModel):
    """Request para cálculo de prazo."""
    data_inicial: str  # ISO format
    numero_dias: int
    tipo_prazo: str = "dias_uteis"  # "dias_uteis" ou "dias_corridos"
    tribunal: Optional[str] = None
    incluir_feriados: bool = True
    incluir_suspensoes: bool = True


class DeadlineCalculationResponse(BaseModel):
    """Response do cálculo de prazo."""
    success: bool
    data_inicial: str
    data_final: str
    numero_dias: int
    tipo_prazo: str
    tribunal: Optional[str]
    dias_totais: int
    dias_uteis: int
    feriados_considerados: bool
    suspensoes_consideradas: bool
    timestamp: str


# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/calculate", response_model=DeadlineCalculationResponse)
async def calculate_deadline(
    request: DeadlineCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calcular prazo processual.

    Calcula a data final de um prazo processual considerando:
    - Dias úteis ou corridos
    - Feriados nacionais
    - Suspensões judiciárias
    - Regras específicas por tribunal
    """
    try:
        # Converter data inicial
        try:
            data_inicial = datetime.fromisoformat(request.data_inicial.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de data inválido. Use formato ISO (YYYY-MM-DDTHH:MM:SS)"
            )

        # Validar tipo de prazo
        if request.tipo_prazo not in ["dias_uteis", "dias_corridos"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="tipo_prazo deve ser 'dias_uteis' ou 'dias_corridos'"
            )

        # Calcular prazo
        resultado = deadline_calculator.calcular_prazo(
            data_inicial=data_inicial,
            numero_dias=request.numero_dias,
            tipo_prazo=request.tipo_prazo,
            tribunal=request.tribunal,
            incluir_feriados=request.incluir_feriados,
            incluir_suspensoes=request.incluir_suspensoes
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular prazo: {str(e)}"
        )


@router.get("/holidays/{ano}")
async def get_holidays(
    ano: int,
    tribunal: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter lista de feriados do ano.

    Retorna todos os feriados nacionais e, se especificado,
    feriados regionais do tribunal.
    """
    try:
        if ano < 2000 or ano > 2100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ano deve estar entre 2000 e 2100"
            )

        feriados = deadline_calculator.obter_feriados_ano(ano, tribunal)

        return {
            "success": True,
            "ano": ano,
            "tribunal": tribunal,
            "feriados": feriados,
            "total": len(feriados)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter feriados: {str(e)}"
        )


@router.get("/validate-date")
async def validate_working_day(
    data: str,
    tribunal: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validar se uma data é dia útil.

    Verifica se a data fornecida é um dia útil considerando:
    - Fins de semana
    - Feriados nacionais
    - Suspensões judiciárias
    """
    try:
        # Converter data
        try:
            data_obj = datetime.fromisoformat(data.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de data inválido. Use formato ISO (YYYY-MM-DDTHH:MM:SS)"
            )

        # Verificar se é dia útil
        eh_dia_util = deadline_calculator._eh_dia_util(
            data_obj,
            incluir_feriados=True,
            incluir_suspensoes=True,
            tribunal=tribunal
        )

        # Informações adicionais
        eh_feriado = deadline_calculator._eh_feriado_nacional(data_obj)
        eh_fim_semana = data_obj.weekday() >= 5

        return {
            "success": True,
            "data": data_obj.isoformat(),
            "eh_dia_util": eh_dia_util,
            "eh_feriado": eh_feriado,
            "eh_fim_semana": eh_fim_semana,
            "dia_semana": data_obj.strftime("%A"),
            "tribunal": tribunal
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar data: {str(e)}"
        )



