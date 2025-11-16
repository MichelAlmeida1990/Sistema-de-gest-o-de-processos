from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Numeric, Integer
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel


class PrecatórioNatureza(PyEnum):
    ALIMENTAR = "alimentar"
    COMUM = "comum"


class PrecatórioStatus(PyEnum):
    AGUARDANDO_INSCRICAO = "aguardando_inscricao"
    INSCRITO_ORCAMENTO = "inscrito_orcamento"
    AGUARDANDO_PAGAMENTO = "aguardando_pagamento"
    PAGO_PARCIAL = "pago_parcial"
    PAGO = "pago"
    NEGOCIADO = "negociado"


class Precatorio(BaseModel):
    """Modelo de precatório vinculado a um processo."""

    __tablename__ = "precatorios"

    numero = Column(String(100), unique=True, index=True, nullable=False)
    processo_origem = Column(String(100), nullable=True)
    tribunal = Column(String(100), nullable=True)
    ente_devedor = Column(String(255), nullable=False)  # União, Estado, Município etc.

    natureza = Column(Enum(PrecatórioNatureza), default=PrecatórioNatureza.COMUM, nullable=False)
    status = Column(Enum(PrecatórioStatus), default=PrecatórioStatus.AGUARDANDO_INSCRICAO, nullable=False)

    data_inscricao = Column(DateTime(timezone=True), nullable=True)
    ano_orcamento = Column(Integer, nullable=True)

    valor_origem = Column(Numeric(15, 2), nullable=False)
    valor_atualizado = Column(Numeric(15, 2), nullable=True)
    moeda = Column(String(3), default="BRL", nullable=False)

    cliente_nome = Column(String(255), nullable=False)
    cliente_documento = Column(String(20), nullable=True)

    processo_id = Column(ForeignKey("processes.id"), nullable=True)
    processo = relationship("Process", foreign_keys=[processo_id])

    observacoes = Column(String(1000), nullable=True)


