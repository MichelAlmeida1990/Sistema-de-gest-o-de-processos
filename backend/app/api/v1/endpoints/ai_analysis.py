# ===========================================
# ENDPOINTS DE ANÁLISE COM IA
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.ai_service import ai_service
from sqlalchemy.orm import Session

router = APIRouter()


# ===========================================
# SCHEMAS
# ===========================================

class TextAnalysisRequest(BaseModel):
    """Request para análise de texto."""
    text: str
    task: str = "sentiment-analysis"  # sentiment-analysis, text-classification, etc.


class TextGenerationRequest(BaseModel):
    """Request para geração de texto."""
    prompt: str
    max_length: int = 200
    temperature: float = 0.7


class TextSummarizationRequest(BaseModel):
    """Request para resumo de texto."""
    text: str
    max_length: int = 100
    min_length: int = 30


class ChatRequest(BaseModel):
    """Request para chat/completar conversa."""
    messages: List[Dict[str, str]]
    system_prompt: Optional[str] = None


# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/analyze")
async def analyze_text(
    request: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analisar texto usando modelos do Hugging Face.

    Tarefas disponíveis:
    - sentiment-analysis: Análise de sentimento
    - text-classification: Classificação de texto
    - summarization: Resumo de texto
    - question-answering: Resposta a perguntas
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Texto não pode estar vazio"
            )

        resultado = await ai_service.analyze_text(
            text=request.text,
            task=request.task
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar texto: {str(e)}"
        )


@router.post("/generate")
async def generate_text(
    request: TextGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Gerar texto usando modelo de linguagem.

    Gera texto baseado em um prompt inicial.
    """
    try:
        if not request.prompt or len(request.prompt.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt não pode estar vazio"
            )

        if request.temperature < 0 or request.temperature > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Temperature deve estar entre 0 e 1"
            )

        resultado = await ai_service.generate_text(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar texto: {str(e)}"
        )


@router.post("/summarize")
async def summarize_text(
    request: TextSummarizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resumir texto.

    Gera um resumo do texto fornecido.
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Texto não pode estar vazio"
            )

        if request.min_length >= request.max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_length deve ser menor que max_length"
            )

        resultado = await ai_service.summarize_text(
            text=request.text,
            max_length=request.max_length,
            min_length=request.min_length
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao resumir texto: {str(e)}"
        )


@router.post("/chat")
async def chat_completion(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Completar conversa/chat usando modelo de linguagem.

    Permite conversar com o modelo de IA em formato de chat.
    """
    try:
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Messages não pode estar vazio"
            )

        # Validar formato das mensagens
        for msg in request.messages:
            if "role" not in msg or "content" not in msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cada mensagem deve ter 'role' e 'content'"
                )

        resultado = await ai_service.chat_completion(
            messages=request.messages,
            system_prompt=request.system_prompt
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao completar chat: {str(e)}"
        )


@router.get("/models")
async def get_available_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter lista de modelos disponíveis.

    Retorna informações sobre os modelos configurados.
    """
    try:
        return {
            "success": True,
            "mode": ai_service.mode,
            "models": {
                "default": ai_service.model,
                "llm": ai_service.llm_model
            },
            "available_tasks": [
                "sentiment-analysis",
                "text-classification",
                "summarization",
                "question-answering",
                "text-generation",
                "translation"
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter modelos: {str(e)}"
        )



