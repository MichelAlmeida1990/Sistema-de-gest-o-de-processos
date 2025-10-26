# ===========================================
# ENDPOINTS API - FUNIL DE PROCESSOS
# ===========================================

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.funnel import (
    ProcessFunnel, FunnelStage, ProcessStage, FunnelTransition
)
from app.models.process import Process
from app.schemas.funnel import (
    ProcessFunnelCreate, ProcessFunnelUpdate, ProcessFunnel as ProcessFunnelSchema,
    FunnelStageCreate, FunnelStageUpdate, FunnelStage as FunnelStageSchema,
    ProcessStageCreate, ProcessStage as ProcessStageSchema,
    FunnelTransitionCreate, FunnelTransition as FunnelTransitionSchema,
    ProcessFunnelSummary, FunnelAnalytics, MoveProcessStageRequest,
    FunnelStageStats
)

router = APIRouter()


@router.get("/funnels", response_model=List[ProcessFunnelSchema])
async def list_funnels(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos os funis de processos."""
    try:
        funnels = db.query(ProcessFunnel).filter(
            ProcessFunnel.is_active == True
        ).offset(skip).limit(limit).all()
        
        return funnels
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar funis: {str(e)}"
        )


@router.post("/funnels", response_model=ProcessFunnelSchema)
async def create_funnel(
    funnel_data: ProcessFunnelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar novo funil de processos."""
    try:
        # Verificar se já existe um funil padrão
        if funnel_data.is_default:
            existing_default = db.query(ProcessFunnel).filter(
                ProcessFunnel.is_default == True,
                ProcessFunnel.is_active == True
            ).first()
            
            if existing_default:
                existing_default.is_default = False
                db.commit()
        
        # Criar funil
        funnel = ProcessFunnel(
            name=funnel_data.name,
            description=funnel_data.description,
            is_default=funnel_data.is_default,
            is_active=funnel_data.is_active
        )
        
        db.add(funnel)
        db.commit()
        db.refresh(funnel)
        
        # Criar etapas se fornecidas
        if funnel_data.stages:
            for stage_data in funnel_data.stages:
                stage = FunnelStage(
                    funnel_id=funnel.id,
                    name=stage_data.name,
                    description=stage_data.description,
                    stage_type=stage_data.stage_type,
                    order_position=stage_data.order_position,
                    color=stage_data.color,
                    is_active=stage_data.is_active
                )
                db.add(stage)
            
            db.commit()
        
        return funnel
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar funil: {str(e)}"
        )


@router.get("/funnels/{funnel_id}", response_model=ProcessFunnelSchema)
async def get_funnel(
    funnel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um funil específico."""
    try:
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.id == funnel_id,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funil não encontrado"
            )
        
        return funnel
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter funil: {str(e)}"
        )


@router.put("/funnels/{funnel_id}", response_model=ProcessFunnelSchema)
async def update_funnel(
    funnel_id: int,
    funnel_data: ProcessFunnelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar funil de processos."""
    try:
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.id == funnel_id,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funil não encontrado"
            )
        
        # Verificar se está definindo como padrão
        if funnel_data.is_default and not funnel.is_default:
            existing_default = db.query(ProcessFunnel).filter(
                ProcessFunnel.is_default == True,
                ProcessFunnel.is_active == True,
                ProcessFunnel.id != funnel_id
            ).first()
            
            if existing_default:
                existing_default.is_default = False
                db.commit()
        
        # Atualizar campos
        update_data = funnel_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(funnel, field, value)
        
        funnel.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(funnel)
        
        return funnel
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar funil: {str(e)}"
        )


@router.delete("/funnels/{funnel_id}")
async def delete_funnel(
    funnel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Excluir funil de processos (soft delete)."""
    try:
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.id == funnel_id,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funil não encontrado"
            )
        
        if funnel.is_default:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir o funil padrão"
            )
        
        # Soft delete
        funnel.is_active = False
        funnel.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Funil excluído com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir funil: {str(e)}"
        )


@router.get("/funnels/{funnel_id}/stages", response_model=List[FunnelStageSchema])
async def list_funnel_stages(
    funnel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar etapas de um funil específico."""
    try:
        stages = db.query(FunnelStage).filter(
            FunnelStage.funnel_id == funnel_id,
            FunnelStage.is_active == True
        ).order_by(FunnelStage.order_position).all()
        
        return stages
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar etapas: {str(e)}"
        )


@router.post("/funnels/{funnel_id}/stages", response_model=FunnelStageSchema)
async def create_funnel_stage(
    funnel_id: int,
    stage_data: FunnelStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar nova etapa em um funil."""
    try:
        # Verificar se o funil existe
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.id == funnel_id,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funil não encontrado"
            )
        
        # Criar etapa
        stage = FunnelStage(
            funnel_id=funnel_id,
            name=stage_data.name,
            description=stage_data.description,
            stage_type=stage_data.stage_type,
            order_position=stage_data.order_position,
            color=stage_data.color,
            is_active=stage_data.is_active
        )
        
        db.add(stage)
        db.commit()
        db.refresh(stage)
        
        return stage
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar etapa: {str(e)}"
        )


@router.put("/funnels/{funnel_id}/stages/{stage_id}", response_model=FunnelStageSchema)
async def update_funnel_stage(
    funnel_id: int,
    stage_id: int,
    stage_data: FunnelStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar etapa do funil."""
    try:
        stage = db.query(FunnelStage).filter(
            FunnelStage.id == stage_id,
            FunnelStage.funnel_id == funnel_id,
            FunnelStage.is_active == True
        ).first()
        
        if not stage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Etapa não encontrada"
            )
        
        # Atualizar campos
        update_data = stage_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stage, field, value)
        
        stage.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(stage)
        
        return stage
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar etapa: {str(e)}"
        )


@router.get("/processes/{process_id}/stages", response_model=List[ProcessStageSchema])
async def get_process_stages(
    process_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter histórico de etapas de um processo."""
    try:
        stages = db.query(ProcessStage).filter(
            ProcessStage.process_id == process_id
        ).order_by(ProcessStage.entered_at.desc()).all()
        
        return stages
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter etapas do processo: {str(e)}"
        )


@router.post("/processes/{process_id}/move-stage")
async def move_process_stage(
    process_id: int,
    move_data: MoveProcessStageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mover processo para nova etapa."""
    try:
        # Verificar se o processo existe
        process = db.query(Process).filter(Process.id == process_id).first()
        if not process:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
        
        # Verificar se a etapa existe
        stage = db.query(FunnelStage).filter(
            FunnelStage.id == move_data.to_stage_id,
            FunnelStage.is_active == True
        ).first()
        if not stage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Etapa não encontrada"
            )
        
        # Fechar etapa atual se existir
        current_stage = db.query(ProcessStage).filter(
            ProcessStage.process_id == process_id,
            ProcessStage.exited_at.is_(None)
        ).first()
        
        if current_stage:
            current_stage.exited_at = datetime.utcnow()
            db.commit()
        
        # Criar nova etapa
        new_stage = ProcessStage(
            process_id=process_id,
            stage_id=move_data.to_stage_id,
            notes=move_data.notes,
            created_by=current_user.id
        )
        
        db.add(new_stage)
        
        # Atualizar funil do processo se necessário
        if not process.funnel_id:
            process.funnel_id = stage.funnel_id
        
        db.commit()
        
        return {
            "message": "Processo movido para nova etapa com sucesso",
            "process_id": process_id,
            "new_stage_id": move_data.to_stage_id,
            "stage_name": stage.name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao mover processo: {str(e)}"
        )


@router.get("/funnels/{funnel_id}/analytics", response_model=FunnelAnalytics)
async def get_funnel_analytics(
    funnel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter analytics de um funil."""
    try:
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.id == funnel_id,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funil não encontrado"
            )
        
        # Obter etapas
        stages = db.query(FunnelStage).filter(
            FunnelStage.funnel_id == funnel_id,
            FunnelStage.is_active == True
        ).order_by(FunnelStage.order_position).all()
        
        # Calcular estatísticas
        processes_by_stage = {}
        average_time_by_stage = {}
        conversion_rate = {}
        
        total_processes = 0
        
        for stage in stages:
            # Contar processos na etapa
            processes_in_stage = db.query(ProcessStage).filter(
                ProcessStage.stage_id == stage.id,
                ProcessStage.exited_at.is_(None)
            ).count()
            
            processes_by_stage[stage.name] = {
                "stage_id": stage.id,
                "total_processes": processes_in_stage,
                "stage_type": stage.stage_type.value,
                "color": stage.color
            }
            
            total_processes += processes_in_stage
            
            # Calcular tempo médio na etapa
            avg_time = db.query(ProcessStage).filter(
                ProcessStage.stage_id == stage.id,
                ProcessStage.exited_at.isnot(None)
            ).all()
            
            if avg_time:
                total_time = sum([
                    (ps.exited_at - ps.entered_at).total_seconds()
                    for ps in avg_time
                ])
                average_time_by_stage[stage.name] = total_time / len(avg_time)
            else:
                average_time_by_stage[stage.name] = 0
        
        # Calcular taxa de conversão
        for i, stage in enumerate(stages):
            if i > 0:
                prev_stage = stages[i-1]
                prev_count = processes_by_stage[prev_stage.name]["total_processes"]
                current_count = processes_by_stage[stage.name]["total_processes"]
                
                if prev_count > 0:
                    conversion_rate[stage.name] = (current_count / prev_count) * 100
                else:
                    conversion_rate[stage.name] = 0
        
        return FunnelAnalytics(
            funnel_id=funnel_id,
            funnel_name=funnel.name,
            total_processes=total_processes,
            processes_by_stage=processes_by_stage,
            average_time_by_stage=average_time_by_stage,
            conversion_rate=conversion_rate
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter analytics: {str(e)}"
        )


@router.get("/funnels/default", response_model=ProcessFunnelSchema)
async def get_default_funnel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter funil padrão."""
    try:
        funnel = db.query(ProcessFunnel).filter(
            ProcessFunnel.is_default == True,
            ProcessFunnel.is_active == True
        ).first()
        
        if not funnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhum funil padrão encontrado"
            )
        
        return funnel
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter funil padrão: {str(e)}"
        )

