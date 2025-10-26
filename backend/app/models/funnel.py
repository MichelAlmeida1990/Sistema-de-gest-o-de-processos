# ===========================================
# MODELOS DE DADOS - FUNIL DE PROCESSOS
# ===========================================

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class FunnelStageType(enum.Enum):
    """Tipos de etapas do funil."""
    DISTRIBUICAO = "distribuicao"
    ANALISE_INICIAL = "analise_inicial"
    AUDIENCIA = "audiencia"
    SENTENCA = "sentenca"
    EXECUCAO = "execucao"
    ARQUIVADO = "arquivado"
    CANCELADO = "cancelado"


class ProcessFunnel(Base):
    """Modelo para definir as etapas do funil de processos."""
    
    __tablename__ = "process_funnels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    stages = relationship("FunnelStage", back_populates="funnel", cascade="all, delete-orphan")
    # processes = relationship("Process", foreign_keys="Process.funnel_id")


class FunnelStage(Base):
    """Modelo para as etapas do funil."""
    
    __tablename__ = "funnel_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    funnel_id = Column(Integer, ForeignKey("process_funnels.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    stage_type = Column(Enum(FunnelStageType), nullable=False)
    order_position = Column(Integer, nullable=False, default=0)
    color = Column(String(7), nullable=True, default="#3498db")  # Cor hexadecimal
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    funnel = relationship("ProcessFunnel", back_populates="stages")
    process_stages = relationship("ProcessStage", back_populates="stage")


class ProcessStage(Base):
    """Modelo para rastrear em qual etapa cada processo está."""
    
    __tablename__ = "process_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), nullable=False)
    stage_id = Column(Integer, ForeignKey("funnel_stages.id"), nullable=False)
    entered_at = Column(DateTime(timezone=True), server_default=func.now())
    exited_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos (temporariamente desabilitados)
    # process = relationship("Process", back_populates="stage_history")
    stage = relationship("FunnelStage", back_populates="process_stages")
    creator = relationship("User")


class FunnelTransition(Base):
    """Modelo para definir transições permitidas entre etapas."""
    
    __tablename__ = "funnel_transitions"
    
    id = Column(Integer, primary_key=True, index=True)
    funnel_id = Column(Integer, ForeignKey("process_funnels.id"), nullable=False)
    from_stage_id = Column(Integer, ForeignKey("funnel_stages.id"), nullable=False)
    to_stage_id = Column(Integer, ForeignKey("funnel_stages.id"), nullable=False)
    is_allowed = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    funnel = relationship("ProcessFunnel")
    from_stage = relationship("FunnelStage", foreign_keys=[from_stage_id])
    to_stage = relationship("FunnelStage", foreign_keys=[to_stage_id])
