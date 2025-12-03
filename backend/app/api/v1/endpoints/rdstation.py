# ===========================================
# ENDPOINTS DE INTEGRAÇÃO RD STATION
# ===========================================

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status, Depends
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.rdstation_service import rdstation_service

router = APIRouter()


# ===========================================
# SCHEMAS PYDANTIC
# ===========================================

class ContactCreate(BaseModel):
    """Schema para criar contato."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class DealCreate(BaseModel):
    """Schema para criar oportunidade."""
    name: str
    contact_id: int
    company_id: Optional[int] = None
    deal_stage_id: int
    amount: Optional[float] = None
    closed_at: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None


class EventCreate(BaseModel):
    """Schema para criar evento."""
    event_type: str
    event_family: str = "CDP"
    payload: Dict[str, Any]


class WebhookCreate(BaseModel):
    """Schema para criar webhook."""
    url: str
    events: List[str]


class ProcessSyncData(BaseModel):
    """Schema para sincronizar processo."""
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    process_number: str
    status: str
    estimated_value: Optional[float] = None
    type: Optional[str] = None


# ===========================================
# ENDPOINTS
# ===========================================

@router.get("/status")
async def get_rdstation_status():
    """Verificar status da API RD Station."""
    try:
        status_info = await rdstation_service.check_api_status()
        return {
            "success": True,
            "data": status_info
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao verificar status da API RD Station: {str(e)}"
        )


@router.post("/contacts")
async def create_contact(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_user)
):
    """Criar contato no RD Station."""
    try:
        contact_dict = contact_data.dict(exclude_none=True)
        contact = await rdstation_service.create_contact(contact_dict)
        
        if contact:
            return {
                "success": True,
                "message": "Contato criado com sucesso",
                "contact": contact
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar contato no RD Station"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar contato: {str(e)}"
        )


@router.get("/contacts/{email}")
async def get_contact_by_email(
    email: str,
    current_user: User = Depends(get_current_user)
):
    """Buscar contato por email no RD Station."""
    try:
        contact = await rdstation_service.get_contact_by_email(email)
        
        if contact:
            return {
                "success": True,
                "contact": contact
            }
        else:
            return {
                "success": False,
                "message": "Contato não encontrado",
                "contact": None
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar contato: {str(e)}"
        )


@router.patch("/contacts/{contact_id}")
async def update_contact(
    contact_id: int,
    contact_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Atualizar contato no RD Station."""
    try:
        contact = await rdstation_service.update_contact(contact_id, contact_data)
        
        if contact:
            return {
                "success": True,
                "message": "Contato atualizado com sucesso",
                "contact": contact
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar contato no RD Station"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar contato: {str(e)}"
        )


@router.post("/deals")
async def create_deal(
    deal_data: DealCreate,
    current_user: User = Depends(get_current_user)
):
    """Criar oportunidade no RD Station."""
    try:
        deal_dict = deal_data.dict(exclude_none=True)
        deal = await rdstation_service.create_deal(deal_dict)
        
        if deal:
            return {
                "success": True,
                "message": "Oportunidade criada com sucesso",
                "deal": deal
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar oportunidade no RD Station"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar oportunidade: {str(e)}"
        )


@router.post("/events")
async def add_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user)
):
    """Adicionar evento de conversão no RD Station."""
    try:
        event_dict = event_data.dict()
        success = await rdstation_service.add_event(event_dict)
        
        if success:
            return {
                "success": True,
                "message": "Evento adicionado com sucesso"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao adicionar evento no RD Station"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar evento: {str(e)}"
        )


@router.post("/sync/process")
async def sync_process_to_rd(
    process_data: ProcessSyncData,
    current_user: User = Depends(get_current_user)
):
    """Sincronizar processo para o RD Station."""
    try:
        process_dict = process_data.dict(exclude_none=True)
        result = await rdstation_service.sync_process_to_rd(process_dict)
        
        return {
            "success": result["success"],
            "message": result["message"],
            "contact": result.get("contact"),
            "deal": result.get("deal")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao sincronizar processo: {str(e)}"
        )


@router.post("/webhooks")
async def create_webhook(
    webhook_data: WebhookCreate,
    current_user: User = Depends(get_current_user)
):
    """Criar webhook no RD Station."""
    try:
        webhook = await rdstation_service.create_webhook(
            webhook_data.url,
            webhook_data.events
        )
        
        if webhook:
            return {
                "success": True,
                "message": "Webhook criado com sucesso",
                "webhook": webhook
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar webhook no RD Station"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar webhook: {str(e)}"
        )


@router.get("/api-info")
async def get_api_info():
    """Obter informações sobre a API RD Station e suas capacidades."""
    try:
        return {
            "success": True,
            "api_info": {
                "name": "RD Station API",
                "description": (
                    "API oficial do RD Station para "
                    "automação de marketing e CRM"
                ),
                "base_url": rdstation_service.BASE_URL,
                "api_version": rdstation_service.API_VERSION,
                "authentication": "OAuth 2.0 ou Token de API",
                "rate_limit": "Variável por plano (geralmente 100 req/min)",
                "endpoints": [
                    "GET /status - Status da API",
                    "POST /contacts - Criar contato",
                    "GET /contacts/{email} - Buscar contato por email",
                    "PATCH /contacts/{contact_id} - Atualizar contato",
                    "POST /deals - Criar oportunidade",
                    "POST /events - Adicionar evento de conversão",
                    "POST /sync/process - Sincronizar processo",
                    "POST /webhooks - Criar webhook"
                ],
                "features": [
                    "Gestão de Contatos",
                    "Gestão de Oportunidades (Deals)",
                    "Eventos e Conversões",
                    "Webhooks",
                    "Automação de Marketing",
                    "Email Marketing",
                    "Analytics e ROI"
                ],
                "documentation": "https://developers.rdstation.com/pt-BR/reference",
                "api_key_info": "Para obter tokens: https://app.rdstation.com.br/configuracoes/integracoes/api"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter informações da API: {str(e)}"
        )

