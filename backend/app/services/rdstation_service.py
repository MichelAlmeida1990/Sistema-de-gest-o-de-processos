# ===========================================
# SERVIÇO DE INTEGRAÇÃO COM API RD STATION
# ===========================================

import httpx
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)

class RDStationService:
    """Serviço para integração com a API RD Station."""

    BASE_URL = "https://api.rdstation.com.br"
    API_VERSION = "v1"
    TIMEOUT = 30
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=10.0))
        self.api_token = settings.RDSTATION_API_TOKEN if hasattr(settings, 'RDSTATION_API_TOKEN') else None
        self.public_token = settings.RDSTATION_PUBLIC_TOKEN if hasattr(settings, 'RDSTATION_PUBLIC_TOKEN') else None
        self.enabled = settings.RDSTATION_ENABLED if hasattr(settings, 'RDSTATION_ENABLED') else False

    async def create_contact(self, contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Criar contato no RD Station.
        
        Args:
            contact_data: Dados do contato {
                'name': str,
                'email': str,
                'phone': str (opcional),
                'company': str (opcional),
                'tags': List[str] (opcional),
                'custom_fields': Dict (opcional)
            }
        
        Returns:
            Dados do contato criado ou None
        """
        if not self.enabled or not self.api_token:
            logger.warning("RD Station não está habilitado ou token não configurado")
            return None

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/contacts"
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            logger.info(f"Criando contato no RD Station: {contact_data.get('email')}")
            response = await self.client.post(url, headers=headers, json=contact_data, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Contato criado com sucesso no RD Station: {data.get('id')}")
                return data
            else:
                logger.error(f"Erro ao criar contato: {response.status_code} - {response.text}")
                return None
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao criar contato no RD Station")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao criar contato: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar contato no RD Station: {e}")
            return None

    async def create_deal(self, deal_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Criar oportunidade (deal) no RD Station.
        
        Args:
            deal_data: Dados da oportunidade {
                'name': str,
                'contact_id': int,
                'company_id': int (opcional),
                'deal_stage_id': int,
                'amount': float (opcional),
                'closed_at': str (opcional),
                'custom_fields': Dict (opcional)
            }
        
        Returns:
            Dados da oportunidade criada ou None
        """
        if not self.enabled or not self.api_token:
            logger.warning("RD Station não está habilitado ou token não configurado")
            return None

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/deals"
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            logger.info(f"Criando oportunidade no RD Station: {deal_data.get('name')}")
            response = await self.client.post(url, headers=headers, json=deal_data, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Oportunidade criada com sucesso no RD Station: {data.get('id')}")
                return data
            else:
                logger.error(f"Erro ao criar oportunidade: {response.status_code} - {response.text}")
                return None
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao criar oportunidade no RD Station")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao criar oportunidade: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar oportunidade no RD Station: {e}")
            return None

    async def add_event(self, event_data: Dict[str, Any]) -> bool:
        """
        Adicionar evento de conversão no RD Station.
        
        Args:
            event_data: Dados do evento {
                'event_type': str (ex: 'CONVERSION'),
                'event_family': str (ex: 'CDP'),
                'payload': {
                    'email': str,
                    'name': str (opcional),
                    'conversion_identifier': str,
                    'cf_custom_field': str (opcional)
                }
            }
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled or not self.public_token:
            logger.warning("RD Station não está habilitado ou token público não configurado")
            return False

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/events"
            headers = {
                "Authorization": f"Bearer {self.public_token}",
                "Content-Type": "application/json"
            }
            
            logger.info(f"Adicionando evento no RD Station: {event_data.get('event_type')}")
            response = await self.client.post(url, headers=headers, json=event_data, timeout=15.0)
            
            if response.status_code == 200:
                logger.info("Evento adicionado com sucesso no RD Station")
                return True
            else:
                logger.error(f"Erro ao adicionar evento: {response.status_code} - {response.text}")
                return False
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao adicionar evento no RD Station")
            return False
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao adicionar evento: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado ao adicionar evento no RD Station: {e}")
            return False

    async def update_contact(self, contact_id: int, contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Atualizar contato no RD Station."""
        if not self.enabled or not self.api_token:
            logger.warning("RD Station não está habilitado ou token não configurado")
            return None

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/contacts/{contact_id}"
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            logger.info(f"Atualizando contato no RD Station: {contact_id}")
            response = await self.client.patch(url, headers=headers, json=contact_data, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Contato atualizado com sucesso no RD Station: {contact_id}")
                return data
            else:
                logger.error(f"Erro ao atualizar contato: {response.status_code} - {response.text}")
                return None
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao atualizar contato no RD Station")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao atualizar contato: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao atualizar contato no RD Station: {e}")
            return None

    async def get_contact_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Buscar contato por email."""
        if not self.enabled or not self.api_token:
            logger.warning("RD Station não está habilitado ou token não configurado")
            return None

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/contacts"
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            params = {"email": email}
            logger.info(f"Buscando contato no RD Station: {email}")
            response = await self.client.get(url, headers=headers, params=params, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                contacts = data.get("contacts", [])
                if contacts:
                    logger.info(f"Contato encontrado no RD Station: {contacts[0].get('id')}")
                    return contacts[0]
                logger.info("Contato não encontrado no RD Station")
                return None
            else:
                logger.error(f"Erro ao buscar contato: {response.status_code} - {response.text}")
                return None
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao buscar contato no RD Station")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao buscar contato: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao buscar contato no RD Station: {e}")
            return None

    async def sync_process_to_rd(self, process_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sincronizar processo para o RD Station.
        
        Cria/atualiza contato e oportunidade no RD Station baseado no processo.
        
        Args:
            process_data: Dados do processo {
                'client_name': str,
                'client_email': str,
                'client_phone': str (opcional),
                'process_number': str,
                'status': str,
                'estimated_value': float (opcional),
                'type': str (opcional)
            }
        
        Returns:
            Dict com resultado da sincronização
        """
        if not self.enabled:
            return {
                "success": False,
                "message": "RD Station não está habilitado",
                "contact": None,
                "deal": None
            }

        try:
            # 1. Criar/atualizar contato
            contact_data = {
                "name": process_data.get("client_name", ""),
                "email": process_data.get("client_email", ""),
                "phone": process_data.get("client_phone", ""),
                "tags": ["processo", process_data.get("status", "").lower()],
                "custom_fields": {
                    "processo_numero": process_data.get("process_number", ""),
                    "processo_tipo": process_data.get("type", ""),
                    "processo_valor": process_data.get("estimated_value", 0)
                }
            }
            
            # Verificar se contato já existe
            existing_contact = await self.get_contact_by_email(contact_data["email"])
            
            if existing_contact:
                # Atualizar contato existente
                contact = await self.update_contact(existing_contact["id"], contact_data)
            else:
                # Criar novo contato
                contact = await self.create_contact(contact_data)
            
            if not contact:
                return {
                    "success": False,
                    "message": "Erro ao criar/atualizar contato",
                    "contact": None,
                    "deal": None
                }
            
            # 2. Criar/atualizar oportunidade (deal)
            deal_data = {
                "name": f"Processo {process_data.get('process_number', '')}",
                "contact_id": contact["id"],
                "amount": float(process_data.get("estimated_value", 0)),
                "deal_stage_id": self._map_process_status_to_deal_stage(
                    process_data.get("status", "")
                ),
                "custom_fields": {
                    "processo_numero": process_data.get("process_number", ""),
                    "processo_tipo": process_data.get("type", ""),
                    "processo_status": process_data.get("status", "")
                }
            }
            
            deal = await self.create_deal(deal_data)
            
            return {
                "success": deal is not None,
                "message": "Sincronização concluída" if deal else "Erro ao criar oportunidade",
                "contact": contact,
                "deal": deal
            }
                
        except Exception as e:
            logger.error(f"Erro ao sincronizar processo para RD Station: {e}")
            return {
                "success": False,
                "message": f"Erro inesperado: {str(e)}",
                "contact": None,
                "deal": None
            }

    def _map_process_status_to_deal_stage(self, process_status: str) -> int:
        """
        Mapear status do processo para estágio de oportunidade no RD Station.
        
        Retorna o ID do estágio no RD Station.
        """
        # Mapeamento padrão (pode ser configurado)
        status_mapping = {
            "DRAFT": 1,           # Início
            "IN_PROGRESS": 2,     # Qualificação
            "PENDING": 3,         # Proposta
            "AWAITING": 4,        # Negociação
            "COMPLETED": 5,       # Ganho
            "CANCELLED": 6        # Perdido
        }
        
        return status_mapping.get(process_status.upper(), 1)

    async def create_webhook(self, webhook_url: str, events: List[str]) -> Optional[Dict[str, Any]]:
        """
        Criar webhook no RD Station para receber eventos.
        
        Args:
            webhook_url: URL do nosso sistema para receber webhooks
            events: Lista de eventos para escutar (ex: ['CONTACT_CREATED', 'DEAL_UPDATED'])
        
        Returns:
            Dados do webhook criado ou None
        """
        if not self.enabled or not self.api_token:
            logger.warning("RD Station não está habilitado ou token não configurado")
            return None

        try:
            url = f"{self.BASE_URL}/{self.API_VERSION}/webhooks"
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            webhook_data = {
                "url": webhook_url,
                "events": events
            }
            
            logger.info(f"Criando webhook no RD Station: {webhook_url}")
            response = await self.client.post(url, headers=headers, json=webhook_data, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Webhook criado com sucesso no RD Station: {data.get('id')}")
                return data
            else:
                logger.error(f"Erro ao criar webhook: {response.status_code} - {response.text}")
                return None
                
        except httpx.TimeoutException:
            logger.warning("Timeout ao criar webhook no RD Station")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao criar webhook: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar webhook no RD Station: {e}")
            return None

    async def check_api_status(self) -> Dict[str, Any]:
        """Verificar status da API RD Station."""
        return {
            "status": "active" if self.enabled else "disabled",
            "enabled": self.enabled,
            "api_token_configured": bool(self.api_token),
            "public_token_configured": bool(self.public_token),
            "base_url": self.BASE_URL,
            "api_version": self.API_VERSION,
            "last_check": datetime.now().isoformat(),
            "info": "RD Station API - Requer tokens configurados para funcionar",
            "documentation": "https://developers.rdstation.com/pt-BR/reference"
        }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

# Instância global do serviço
rdstation_service = RDStationService()

