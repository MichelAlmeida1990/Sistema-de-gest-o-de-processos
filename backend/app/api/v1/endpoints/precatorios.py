from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Precatorio, User
from app.schemas import (
    PrecatorioCreate,
    PrecatorioUpdate,
    PrecatorioResponse,
    PrecatorioList,
)
from app.services.indices_economicos import indices_economicos_service

router = APIRouter()


@router.get("/", response_model=PrecatorioList)
async def list_precatorios(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    ente_devedor: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar precatórios com paginação básica."""
    query = db.query(Precatorio)

    if ente_devedor:
        query = query.filter(Precatorio.ente_devedor.ilike(f"%{ente_devedor}%"))

    if status:
        query = query.filter(Precatorio.status == status)

    total = query.count()
    items = (
        query.order_by(Precatorio.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PrecatorioList(items=items, total=total)


@router.get("/{precatorio_id}", response_model=PrecatorioResponse)
async def get_precatorio(
    precatorio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter detalhes de um precatório."""
    precatorio = db.query(Precatorio).get(precatorio_id)
    if not precatorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Precatório não encontrado"
        )
    return precatorio


@router.post("/", response_model=PrecatorioResponse, status_code=status.HTTP_201_CREATED)
async def create_precatorio(
    data: PrecatorioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Criar novo precatório."""
    # Verificar duplicidade de número
    exists = db.query(Precatorio).filter(Precatorio.numero == data.numero).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um precatório com esse número",
        )

    precatorio = Precatorio(**data.dict())
    db.add(precatorio)
    db.commit()
    db.refresh(precatorio)
    return precatorio


@router.put("/{precatorio_id}", response_model=PrecatorioResponse)
async def update_precatorio(
    precatorio_id: int,
    data: PrecatorioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Atualizar precatório."""
    precatorio = db.query(Precatorio).get(precatorio_id)
    if not precatorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Precatório não encontrado"
        )

    for field, value in data.dict(exclude_unset=True).items():
        setattr(precatorio, field, value)

    db.commit()
    db.refresh(precatorio)
    return precatorio


@router.delete("/{precatorio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_precatorio(
    precatorio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Excluir precatório."""
    precatorio = db.query(Precatorio).get(precatorio_id)
    if not precatorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Precatório não encontrado"
        )

    db.delete(precatorio)
    db.commit()
    return None


@router.post("/{precatorio_id}/calcular-atualizacao")
async def calcular_atualizacao_precatorio(
    precatorio_id: int,
    indice: Optional[str] = Query("IPCA_E", description="Índice a ser usado (IPCA_E, INPC, SELIC, TR)"),
    data_atualizacao: Optional[str] = Query(None, description="Data para calcular atualização (DD/MM/YYYY)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calcular atualização de valor de um precatório usando índice econômico.
    """
    precatorio = db.query(Precatorio).get(precatorio_id)
    if not precatorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Precatório não encontrado"
        )
    
    if not precatorio.valor_origem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precatório não possui valor de origem definido"
        )
    
    if not precatorio.data_inscricao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precatório não possui data de inscrição definida"
        )
    
    # Converter data_inscricao para formato DD/MM/YYYY
    data_base = precatorio.data_inscricao.strftime("%d/%m/%Y") if hasattr(precatorio.data_inscricao, 'strftime') else str(precatorio.data_inscricao)
    
    try:
        resultado = await indices_economicos_service.calcular_atualizacao_precatorio(
            valor_origem=float(precatorio.valor_origem),
            data_base=data_base,
            data_atualizacao=data_atualizacao,
            indice=indice
        )
        
        # Se cálculo foi bem-sucedido, atualizar valor_atualizado no precatório
        if resultado.get("sucesso") and resultado.get("valor_atualizado"):
            precatorio.valor_atualizado = resultado["valor_atualizado"]
            db.commit()
            db.refresh(precatorio)
        
        return {
            "precatorio_id": precatorio_id,
            "precatorio": PrecatorioResponse.model_validate(precatorio),
            "calculo": resultado
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular atualização: {str(e)}"
        )


@router.post("/{precatorio_id}/calcular-atualizacao-acumulada")
async def calcular_atualizacao_acumulada_precatorio(
    precatorio_id: int,
    indice: Optional[str] = Query("IPCA_E", description="Índice a ser usado"),
    data_atualizacao: Optional[str] = Query(None, description="Data final (DD/MM/YYYY)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calcular atualização acumulada mês a mês de um precatório.
    """
    precatorio = db.query(Precatorio).get(precatorio_id)
    if not precatorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Precatório não encontrado"
        )
    
    if not precatorio.valor_origem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precatório não possui valor de origem definido"
        )
    
    if not precatorio.data_inscricao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precatório não possui data de inscrição definida"
        )
    
    data_base = precatorio.data_inscricao.strftime("%d/%m/%Y") if hasattr(precatorio.data_inscricao, 'strftime') else str(precatorio.data_inscricao)
    
    try:
        resultado = await indices_economicos_service.calcular_atualizacao_acumulada(
            valor_origem=float(precatorio.valor_origem),
            data_base=data_base,
            data_atualizacao=data_atualizacao,
            indice=indice
        )
        
        # Se cálculo foi bem-sucedido, atualizar valor_atualizado
        if resultado.get("sucesso") and resultado.get("valor_atualizado"):
            precatorio.valor_atualizado = resultado["valor_atualizado"]
            db.commit()
            db.refresh(precatorio)
        
        return {
            "precatorio_id": precatorio_id,
            "precatorio": PrecatorioResponse.model_validate(precatorio),
            "calculo": resultado
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular atualização acumulada: {str(e)}"
        )


