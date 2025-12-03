# ===========================================
# ENDPOINTS DE JURISPRUDÊNCIA
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.jurisprudence import Jurisprudence, JurisprudenceChat, JurisprudenceStatus
from app.services.jurisprudence_service import jurisprudence_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ===========================================
# SCHEMAS
# ===========================================

class JurisprudenceCreate(BaseModel):
    """Schema para criar análise de jurisprudência."""
    title: str
    full_text: str
    process_number: Optional[str] = None
    tribunal: Optional[str] = None
    court: Optional[str] = None
    decision_date: Optional[datetime] = None


class JurisprudenceResponse(BaseModel):
    """Schema de resposta de jurisprudência."""
    id: int
    process_number: Optional[str]
    tribunal: Optional[str]
    court: Optional[str]
    decision_date: Optional[datetime]
    title: str
    full_text: Optional[str]
    summary: Optional[str]
    keywords: Optional[List[str]]
    ai_analysis: Optional[dict]
    key_points: Optional[List[str]]
    legal_basis: Optional[List[str]]
    arguments: Optional[List[str]]
    similar_cases: Optional[List[dict]]
    comparison_analysis: Optional[dict]
    status: str
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompareRequest(BaseModel):
    """Schema para comparar jurisprudências."""
    text1: str
    text2: str
    title1: Optional[str] = None
    title2: Optional[str] = None


class ChatMessage(BaseModel):
    """Schema para mensagem de chat."""
    role: str  # "user" ou "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Schema para requisição de chat."""
    message: str
    context: Optional[str] = None
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    """Schema de resposta do chat."""
    response: str
    timestamp: str


class SummarizeRequest(BaseModel):
    """Schema para resumir decisão."""
    text: str


class GenerateArgumentsRequest(BaseModel):
    """Schema para gerar argumentos."""
    case_description: str
    jurisprudence_text: Optional[str] = None


# ===========================================
# HELPER FUNCTIONS
# ===========================================

def jurisprudence_to_response(jurisprudence: Jurisprudence) -> JurisprudenceResponse:
    """Converter jurisprudência ORM para Response."""
    return JurisprudenceResponse(
        id=jurisprudence.id,
        process_number=jurisprudence.process_number,
        tribunal=jurisprudence.tribunal,
        court=jurisprudence.court,
        decision_date=jurisprudence.decision_date,
        title=jurisprudence.title,
        full_text=jurisprudence.full_text,
        summary=jurisprudence.summary,
        keywords=jurisprudence.keywords,
        ai_analysis=jurisprudence.ai_analysis,
        key_points=jurisprudence.key_points,
        legal_basis=jurisprudence.legal_basis,
        arguments=jurisprudence.arguments,
        similar_cases=jurisprudence.similar_cases,
        comparison_analysis=jurisprudence.comparison_analysis,
        status=jurisprudence.status.value if hasattr(jurisprudence.status, 'value') else str(jurisprudence.status),
        user_id=jurisprudence.user_id,
        created_at=jurisprudence.created_at,
        updated_at=jurisprudence.updated_at
    )


# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/analyze", response_model=JurisprudenceResponse)
async def analyze_jurisprudence(
    data: JurisprudenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analisar uma jurisprudência com IA.
    
    O sistema irá:
    1. Analisar o texto da decisão
    2. Gerar resumo executivo
    3. Identificar pontos chave
    4. Extrair fundamentação legal
    5. Gerar argumentos estratégicos
    """
    try:
        # Criar registro de jurisprudência
        jurisprudence = Jurisprudence(
            title=data.title,
            full_text=data.full_text,
            process_number=data.process_number,
            tribunal=data.tribunal,
            court=data.court,
            decision_date=data.decision_date,
            status=JurisprudenceStatus.ANALYZING,
            user_id=current_user.id
        )

        db.add(jurisprudence)
        db.commit()
        db.refresh(jurisprudence)

        # Realizar análise com IA
        try:
            analysis = await jurisprudence_service.analyze_jurisprudence(
                text=data.full_text,
                process_number=data.process_number,
                tribunal=data.tribunal
            )

            # Atualizar jurisprudência com resultados
            jurisprudence.ai_analysis = analysis
            jurisprudence.summary = analysis.get("summary", "")
            jurisprudence.key_points = analysis.get("key_points", [])
            jurisprudence.legal_basis = analysis.get("legal_basis", [])
            jurisprudence.arguments = analysis.get("arguments", [])
            jurisprudence.keywords = analysis.get("keywords", [])
            jurisprudence.status = JurisprudenceStatus.COMPLETED

        except Exception as e:
            logger.error(f"Erro ao analisar jurisprudência {jurisprudence.id}: {e}")
            jurisprudence.status = JurisprudenceStatus.FAILED

        db.commit()
        db.refresh(jurisprudence)

        return jurisprudence_to_response(jurisprudence)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar jurisprudência: {str(e)}"
        )


@router.post("/summarize")
async def summarize_decision(
    data: SummarizeRequest,
    current_user: User = Depends(get_current_user)
):
    """Gerar resumo de uma decisão judicial."""
    try:
        summary = await jurisprudence_service.summarize_decision(data.text)
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao resumir decisão: {str(e)}"
        )


@router.post("/compare")
async def compare_jurisprudences(
    data: CompareRequest,
    current_user: User = Depends(get_current_user)
):
    """Comparar duas jurisprudências."""
    try:
        comparison = await jurisprudence_service.compare_jurisprudences(
            text1=data.text1,
            text2=data.text2,
            title1=data.title1,
            title2=data.title2
        )

        return {
            "success": True,
            "comparison": comparison
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao comparar jurisprudências: {str(e)}"
        )


@router.post("/generate-arguments")
async def generate_arguments(
    data: GenerateArgumentsRequest,
    current_user: User = Depends(get_current_user)
):
    """Gerar argumentos estratégicos baseados em jurisprudência."""
    try:
        arguments = await jurisprudence_service.generate_strategic_arguments(
            case_description=data.case_description,
            jurisprudence_text=data.jurisprudence_text
        )

        return {
            "success": True,
            "arguments": arguments
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar argumentos: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    data: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Chat com IA sobre jurisprudência.
    
    Permite conversar com a IA sobre questões jurídicas,
    jurisprudências, casos, etc.
    """
    try:
        # Converter histórico para formato esperado
        history = None
        if data.history:
            history = [
                {
                    "role": msg.role,
                    "content": msg.content
                }
                for msg in data.history
            ]

        result = await jurisprudence_service.chat_with_ai(
            message=data.message,
            context=data.context,
            history=history
        )

        return ChatResponse(
            response=result.get("response", ""),
            timestamp=result.get("timestamp", datetime.now().isoformat())
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no chat: {str(e)}"
        )


@router.get("/", response_model=List[JurisprudenceResponse])
async def list_jurisprudences(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar jurisprudências do usuário."""
    try:
        jurisprudences = db.query(Jurisprudence)\
            .filter(Jurisprudence.user_id == current_user.id)\
            .order_by(Jurisprudence.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

        return [jurisprudence_to_response(j) for j in jurisprudences]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar jurisprudências: {str(e)}"
        )


@router.get("/{jurisprudence_id}", response_model=JurisprudenceResponse)
async def get_jurisprudence(
    jurisprudence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter jurisprudência específica."""
    try:
        jurisprudence = db.query(Jurisprudence)\
            .filter(Jurisprudence.id == jurisprudence_id)\
            .first()

        if not jurisprudence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jurisprudência não encontrada"
            )

        # Verificar acesso
        if jurisprudence.user_id != current_user.id and current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )

        return jurisprudence_to_response(jurisprudence)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter jurisprudência: {str(e)}"
        )


@router.post("/{jurisprudence_id}/reanalyze", response_model=JurisprudenceResponse)
async def reanalyze_jurisprudence(
    jurisprudence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reanalisar jurisprudência com IA."""
    try:
        jurisprudence = db.query(Jurisprudence)\
            .filter(Jurisprudence.id == jurisprudence_id)\
            .first()

        if not jurisprudence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jurisprudência não encontrada"
            )

        # Verificar acesso
        if jurisprudence.user_id != current_user.id and current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )

        # Atualizar status
        jurisprudence.status = JurisprudenceStatus.ANALYZING
        db.commit()

        # Reanalisar
        analysis = await jurisprudence_service.analyze_jurisprudence(
            text=jurisprudence.full_text or "",
            process_number=jurisprudence.process_number,
            tribunal=jurisprudence.tribunal
        )

        # Atualizar jurisprudência
        jurisprudence.ai_analysis = analysis
        jurisprudence.summary = analysis.get("summary", "")
        jurisprudence.key_points = analysis.get("key_points", [])
        jurisprudence.legal_basis = analysis.get("legal_basis", [])
        jurisprudence.arguments = analysis.get("arguments", [])
        jurisprudence.keywords = analysis.get("keywords", [])
        jurisprudence.status = JurisprudenceStatus.COMPLETED

        db.commit()
        db.refresh(jurisprudence)

        return jurisprudence_to_response(jurisprudence)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao reanalisar jurisprudência: {str(e)}"
        )

