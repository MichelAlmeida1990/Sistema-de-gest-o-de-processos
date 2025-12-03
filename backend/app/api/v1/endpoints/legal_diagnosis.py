# ===========================================
# ENDPOINTS DE DIAGNÓSTICO JURÍDICO
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.legal_diagnosis import LegalDiagnosis, DiagnosisStatus, DiagnosisPriority
from app.services.legal_diagnosis_service import legal_diagnosis_service
from app.schemas.user import UserProfile

router = APIRouter()


# ===========================================
# SCHEMAS
# ===========================================

class DiagnosisCreate(BaseModel):
    """Schema para criar diagnóstico."""
    client_name: str
    case_description: str
    client_email: Optional[EmailStr] = None
    client_phone: Optional[str] = None
    client_document: Optional[str] = None
    case_category: Optional[str] = None
    case_type: Optional[str] = None


class DiagnosisResponse(BaseModel):
    """Schema de resposta de diagnóstico."""
    id: int
    client_name: str
    client_email: Optional[str]
    client_phone: Optional[str]
    client_document: Optional[str]
    case_description: str
    case_category: Optional[str]
    case_type: Optional[str]
    ai_analysis: Optional[dict]
    key_issues: Optional[List[str]]
    possible_solutions: Optional[List[str]]
    success_probability: Optional[float]
    risk_level: Optional[str]
    recommendations: Optional[str]
    estimated_value: Optional[float]
    estimated_duration: Optional[str]
    status: str
    priority: str
    consultation_scheduled: bool
    consultation_date: Optional[datetime]
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiagnosisListResponse(BaseModel):
    """Schema para lista de diagnósticos."""
    diagnoses: List[DiagnosisResponse]
    total: int
    page: int
    per_page: int


# ===========================================
# HELPER FUNCTIONS
# ===========================================

def diagnosis_to_response(diagnosis: LegalDiagnosis) -> DiagnosisResponse:
    """Converter diagnóstico ORM para Response."""
    return DiagnosisResponse(
        id=diagnosis.id,
        client_name=diagnosis.client_name,
        client_email=diagnosis.client_email,
        client_phone=diagnosis.client_phone,
        client_document=diagnosis.client_document,
        case_description=diagnosis.case_description,
        case_category=diagnosis.case_category,
        case_type=diagnosis.case_type,
        ai_analysis=diagnosis.ai_analysis,
        key_issues=diagnosis.key_issues,
        possible_solutions=diagnosis.possible_solutions,
        success_probability=float(diagnosis.success_probability) if diagnosis.success_probability else None,
        risk_level=diagnosis.risk_level,
        recommendations=diagnosis.recommendations,
        estimated_value=float(diagnosis.estimated_value) if diagnosis.estimated_value else None,
        estimated_duration=diagnosis.estimated_duration,
        status=diagnosis.status.value if hasattr(diagnosis.status, 'value') else str(diagnosis.status),
        priority=diagnosis.priority.value if hasattr(diagnosis.priority, 'value') else str(diagnosis.priority),
        consultation_scheduled=diagnosis.consultation_scheduled,
        consultation_date=diagnosis.consultation_date,
        user_id=diagnosis.user_id,
        created_at=diagnosis.created_at,
        updated_at=diagnosis.updated_at
    )


# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/", response_model=DiagnosisResponse)
async def create_diagnosis(
    diagnosis_data: DiagnosisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar novo diagnóstico jurídico.
    
    O sistema irá:
    1. Criar o diagnóstico
    2. Analisar o caso com IA
    3. Identificar questões chave
    4. Gerar possíveis soluções
    5. Calcular probabilidade de êxito
    """
    try:
        diagnosis = await legal_diagnosis_service.create_diagnosis(
            db=db,
            client_name=diagnosis_data.client_name,
            case_description=diagnosis_data.case_description,
            client_email=diagnosis_data.client_email,
            client_phone=diagnosis_data.client_phone,
            client_document=diagnosis_data.client_document,
            case_category=diagnosis_data.case_category,
            case_type=diagnosis_data.case_type,
            user_id=current_user.id
        )

        return diagnosis_to_response(diagnosis)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar diagnóstico: {str(e)}"
        )


@router.get("/", response_model=DiagnosisListResponse)
async def list_diagnoses(
    skip: int = 0,
    limit: int = 100,
    status: Optional[DiagnosisStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar diagnósticos do usuário."""
    try:
        diagnoses = legal_diagnosis_service.list_diagnoses(
            db=db,
            user_id=current_user.id,
            status=status,
            skip=skip,
            limit=limit
        )

        total = len(diagnoses)

        return DiagnosisListResponse(
            diagnoses=[diagnosis_to_response(d) for d in diagnoses],
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar diagnósticos: {str(e)}"
        )


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter diagnóstico específico."""
    try:
        diagnosis = legal_diagnosis_service.get_diagnosis(db=db, diagnosis_id=diagnosis_id)

        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnóstico não encontrado"
            )

        # Verificar se o usuário tem acesso
        if diagnosis.user_id != current_user.id and current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )

        # Converter para dict e criar response
        diagnosis_dict = {
            "id": diagnosis.id,
            "client_name": diagnosis.client_name,
            "client_email": diagnosis.client_email,
            "client_phone": diagnosis.client_phone,
            "client_document": diagnosis.client_document,
            "case_description": diagnosis.case_description,
            "case_category": diagnosis.case_category,
            "case_type": diagnosis.case_type,
            "ai_analysis": diagnosis.ai_analysis,
            "key_issues": diagnosis.key_issues,
            "possible_solutions": diagnosis.possible_solutions,
            "success_probability": float(diagnosis.success_probability) if diagnosis.success_probability else None,
            "risk_level": diagnosis.risk_level,
            "recommendations": diagnosis.recommendations,
            "estimated_value": float(diagnosis.estimated_value) if diagnosis.estimated_value else None,
            "estimated_duration": diagnosis.estimated_duration,
            "status": diagnosis.status.value if hasattr(diagnosis.status, 'value') else str(diagnosis.status),
            "priority": diagnosis.priority.value if hasattr(diagnosis.priority, 'value') else str(diagnosis.priority),
            "consultation_scheduled": diagnosis.consultation_scheduled,
            "consultation_date": diagnosis.consultation_date,
            "user_id": diagnosis.user_id,
            "created_at": diagnosis.created_at,
            "updated_at": diagnosis.updated_at
        }
        return DiagnosisResponse(**diagnosis_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter diagnóstico: {str(e)}"
        )


@router.post("/{diagnosis_id}/analyze")
async def reanalyze_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reanalisar diagnóstico com IA."""
    try:
        diagnosis = legal_diagnosis_service.get_diagnosis(db=db, diagnosis_id=diagnosis_id)

        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnóstico não encontrado"
            )

        # Verificar acesso
        if diagnosis.user_id != current_user.id and current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )

        # Atualizar status
        diagnosis.status = DiagnosisStatus.ANALYZING
        db.commit()

        # Reanalisar
        analysis = await legal_diagnosis_service.analyze_case(
            case_description=diagnosis.case_description,
            case_category=diagnosis.case_category,
            case_type=diagnosis.case_type
        )

        # Atualizar diagnóstico
        diagnosis.ai_analysis = analysis
        diagnosis.key_issues = analysis.get("key_issues", [])
        diagnosis.possible_solutions = analysis.get("possible_solutions", [])
        diagnosis.success_probability = analysis.get("success_probability", 50.0)
        diagnosis.risk_level = analysis.get("risk_level", "medium")
        diagnosis.recommendations = analysis.get("recommendations", "")
        diagnosis.estimated_value = analysis.get("estimated_value")
        diagnosis.estimated_duration = analysis.get("estimated_duration")
        diagnosis.status = DiagnosisStatus.COMPLETED

        db.commit()
        db.refresh(diagnosis)

        # Converter para dict e criar response
        diagnosis_dict = {
            "id": diagnosis.id,
            "client_name": diagnosis.client_name,
            "client_email": diagnosis.client_email,
            "client_phone": diagnosis.client_phone,
            "client_document": diagnosis.client_document,
            "case_description": diagnosis.case_description,
            "case_category": diagnosis.case_category,
            "case_type": diagnosis.case_type,
            "ai_analysis": diagnosis.ai_analysis,
            "key_issues": diagnosis.key_issues,
            "possible_solutions": diagnosis.possible_solutions,
            "success_probability": float(diagnosis.success_probability) if diagnosis.success_probability else None,
            "risk_level": diagnosis.risk_level,
            "recommendations": diagnosis.recommendations,
            "estimated_value": float(diagnosis.estimated_value) if diagnosis.estimated_value else None,
            "estimated_duration": diagnosis.estimated_duration,
            "status": diagnosis.status.value if hasattr(diagnosis.status, 'value') else str(diagnosis.status),
            "priority": diagnosis.priority.value if hasattr(diagnosis.priority, 'value') else str(diagnosis.priority),
            "consultation_scheduled": diagnosis.consultation_scheduled,
            "consultation_date": diagnosis.consultation_date,
            "user_id": diagnosis.user_id,
            "created_at": diagnosis.created_at,
            "updated_at": diagnosis.updated_at
        }
        return DiagnosisResponse(**diagnosis_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao reanalisar diagnóstico: {str(e)}"
        )


@router.post("/analyze-text")
async def analyze_text_only(
    text: str,
    category: Optional[str] = None,
    case_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Analisar apenas texto sem criar diagnóstico.
    
    Útil para testes rápidos ou análises preliminares.
    """
    try:
        analysis = await legal_diagnosis_service.analyze_case(
            case_description=text,
            case_category=category,
            case_type=case_type
        )

        return {
            "success": True,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar texto: {str(e)}"
        )

