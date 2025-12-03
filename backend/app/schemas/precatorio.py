from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.precatorio import PrecatórioNatureza, PrecatórioStatus


class PrecatorioBase(BaseModel):
    numero: str = Field(..., max_length=100)
    processo_origem: Optional[str] = Field(None, max_length=100)
    tribunal: Optional[str] = Field(None, max_length=100)
    ente_devedor: str = Field(..., max_length=255)

    natureza: PrecatórioNatureza = PrecatórioNatureza.COMUM
    status: PrecatórioStatus = PrecatórioStatus.AGUARDANDO_INSCRICAO

    data_inscricao: Optional[datetime] = None
    ano_orcamento: Optional[int] = None

    valor_origem: float
    valor_atualizado: Optional[float] = None
    moeda: str = "BRL"

    cliente_nome: str = Field(..., max_length=255)
    cliente_documento: Optional[str] = Field(None, max_length=20)

    processo_id: Optional[int] = None
    observacoes: Optional[str] = Field(None, max_length=1000)


class PrecatorioCreate(PrecatorioBase):
    pass


class PrecatorioUpdate(BaseModel):
    status: Optional[PrecatórioStatus] = None
    valor_atualizado: Optional[float] = None
    ano_orcamento: Optional[int] = None
    observacoes: Optional[str] = None


class PrecatorioResponse(PrecatorioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True


class PrecatorioList(BaseModel):
    items: List[PrecatorioResponse]
    total: int





