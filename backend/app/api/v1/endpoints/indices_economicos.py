# ===========================================
# ENDPOINTS DE ÍNDICES ECONÔMICOS
# ===========================================

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from datetime import datetime

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.indices_economicos import indices_economicos_service

router = APIRouter()


@router.get("/status")
async def get_indices_status():
    """Verificar status da API de índices econômicos."""
    try:
        status_info = await indices_economicos_service.check_api_status()
        return status_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao verificar status: {str(e)}"
        )


@router.get("/disponiveis")
async def get_indices_disponiveis():
    """Obter lista de índices econômicos disponíveis."""
    try:
        indices = await indices_economicos_service.obter_indices_disponiveis()
        return {
            "success": True,
            "indices": indices,
            "total": len(indices)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar índices: {str(e)}"
        )


@router.get("/{indice}")
async def consultar_indice(
    indice: str,
    data_inicio: Optional[str] = Query(None, description="Data inicial (DD/MM/YYYY)"),
    data_fim: Optional[str] = Query(None, description="Data final (DD/MM/YYYY)")
):
    """Consultar valores de um índice econômico."""
    try:
        dados = await indices_economicos_service.consultar_indice(
            indice, 
            data_inicio=data_inicio,
            data_fim=data_fim
        )
        
        if dados is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Índice {indice} não encontrado ou dados indisponíveis"
            )
        
        return {
            "success": True,
            "indice": indice,
            "dados": dados,
            "total": len(dados)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao consultar índice: {str(e)}"
        )


@router.get("/{indice}/valor/{data}")
async def obter_valor_indice(
    indice: str,
    data: str
):
    """Obter valor de um índice em uma data específica."""
    try:
        valor = await indices_economicos_service.obter_valor_indice_por_data(indice, data)
        
        if valor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Valor do índice {indice} não encontrado para a data {data}"
            )
        
        return {
            "success": True,
            "indice": indice,
            "data": data,
            "valor": valor
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter valor: {str(e)}"
        )


@router.post("/calcular-atualizacao")
async def calcular_atualizacao(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Calcular atualização de valor usando índice econômico.
    
    Body:
    {
        "valor_origem": 100000.00,
        "data_base": "01/01/2020",
        "data_atualizacao": "01/12/2024" (opcional),
        "indice": "IPCA_E" (opcional, padrão: IPCA_E)
    }
    """
    try:
        valor_origem = request.get("valor_origem")
        data_base = request.get("data_base")
        data_atualizacao = request.get("data_atualizacao")
        indice = request.get("indice", "IPCA_E")
        
        if not valor_origem or not data_base:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="valor_origem e data_base são obrigatórios"
            )
        
        resultado = await indices_economicos_service.calcular_atualizacao_precatorio(
            valor_origem=float(valor_origem),
            data_base=data_base,
            data_atualizacao=data_atualizacao,
            indice=indice
        )
        
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular atualização: {str(e)}"
        )


@router.post("/calcular-atualizacao-acumulada")
async def calcular_atualizacao_acumulada(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Calcular atualização acumulada mês a mês.
    
    Body:
    {
        "valor_origem": 100000.00,
        "data_base": "01/01/2020",
        "data_atualizacao": "01/12/2024" (opcional),
        "indice": "IPCA_E" (opcional)
    }
    """
    try:
        valor_origem = request.get("valor_origem")
        data_base = request.get("data_base")
        data_atualizacao = request.get("data_atualizacao")
        indice = request.get("indice", "IPCA_E")
        
        if not valor_origem or not data_base:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="valor_origem e data_base são obrigatórios"
            )
        
        resultado = await indices_economicos_service.calcular_atualizacao_acumulada(
            valor_origem=float(valor_origem),
            data_base=data_base,
            data_atualizacao=data_atualizacao,
            indice=indice
        )
        
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular atualização acumulada: {str(e)}"
        )

