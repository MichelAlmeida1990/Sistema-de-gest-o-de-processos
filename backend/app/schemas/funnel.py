# ===========================================
# SCHEMAS PYDANTIC - FUNIL DE PROCESSOS
# ===========================================

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class FunnelStageType(str, Enum):
    """Tipos de etapas do funil."""
    DISTRIBUICAO = "distribuicao"
    ANALISE_INICIAL = "analise_inicial"
    AUDIENCIA = "audiencia"
    SENTENCA = "sentenca"
    EXECUCAO = "execucao"
    ARQUIVADO = "arquivado"
    CANCELADO = "cancelado"


class FunnelStageBase(BaseModel):
    """Schema base para etapa do funil."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    stage_type: FunnelStageType
    order_position: int = Field(..., ge=0)
    color: Optional[str] = Field("#3498db", pattern="^#[0-9A-Fa-f]{6}$")
    is_active: bool = True


class FunnelStageCreate(FunnelStageBase):
    """Schema para criar etapa do funil."""
    pass


class FunnelStageUpdate(BaseModel):
    """Schema para atualizar etapa do funil."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    stage_type: Optional[FunnelStageType] = None
    order_position: Optional[int] = Field(None, ge=0)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    is_active: Optional[bool] = None


class FunnelStage(FunnelStageBase):
    """Schema completo da etapa do funil."""
    id: int
    funnel_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProcessFunnelBase(BaseModel):
    """Schema base para funil de processos."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_default: bool = False
    is_active: bool = True


class ProcessFunnelCreate(ProcessFunnelBase):
    """Schema para criar funil de processos."""
    stages: Optional[List[FunnelStageCreate]] = []


class ProcessFunnelUpdate(BaseModel):
    """Schema para atualizar funil de processos."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class ProcessFunnel(ProcessFunnelBase):
    """Schema completo do funil de processos."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    stages: List[FunnelStage] = []
    
    class Config:
        from_attributes = True


class ProcessStageBase(BaseModel):
    """Schema base para etapa do processo."""
    stage_id: int
    notes: Optional[str] = None


class ProcessStageCreate(ProcessStageBase):
    """Schema para criar etapa do processo."""
    pass


class ProcessStageUpdate(BaseModel):
    """Schema para atualizar etapa do processo."""
    notes: Optional[str] = None


class ProcessStage(ProcessStageBase):
    """Schema completo da etapa do processo."""
    id: int
    process_id: int
    entered_at: datetime
    exited_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: datetime
    
    # Informações da etapa
    stage: Optional[FunnelStage] = None
    
    class Config:
        from_attributes = True


class FunnelTransitionBase(BaseModel):
    """Schema base para transição do funil."""
    from_stage_id: int
    to_stage_id: int
    is_allowed: bool = True
    requires_approval: bool = False


class FunnelTransitionCreate(FunnelTransitionBase):
    """Schema para criar transição do funil."""
    pass


class FunnelTransition(FunnelTransitionBase):
    """Schema completo da transição do funil."""
    id: int
    funnel_id: int
    created_at: datetime
    
    # Informações das etapas
    from_stage: Optional[FunnelStage] = None
    to_stage: Optional[FunnelStage] = None
    
    class Config:
        from_attributes = True


class ProcessFunnelSummary(BaseModel):
    """Schema para resumo do funil de processos."""
    id: int
    name: str
    total_stages: int
    total_processes: int
    processes_by_stage: Dict[str, int] = {}
    
    class Config:
        from_attributes = True


class FunnelAnalytics(BaseModel):
    """Schema para analytics do funil."""
    funnel_id: int
    funnel_name: str
    total_processes: int
    processes_by_stage: Dict[str, Dict[str, Any]] = {}
    average_time_by_stage: Dict[str, float] = {}
    conversion_rate: Dict[str, float] = {}
    
    class Config:
        from_attributes = True


class MoveProcessStageRequest(BaseModel):
    """Schema para mover processo para nova etapa."""
    to_stage_id: int
    notes: Optional[str] = None
    
    @validator('to_stage_id')
    def validate_stage_id(cls, v):
        if v <= 0:
            raise ValueError('ID da etapa deve ser maior que zero')
        return v


class FunnelStageStats(BaseModel):
    """Schema para estatísticas da etapa."""
    stage_id: int
    stage_name: str
    total_processes: int
    average_time: Optional[float] = None
    conversion_rate: Optional[float] = None
    processes_in_stage: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True
