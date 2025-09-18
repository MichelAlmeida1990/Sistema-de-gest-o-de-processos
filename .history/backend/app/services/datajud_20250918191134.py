# ===========================================
# SERVIÇO DE INTEGRAÇÃO COM DATAJUD (CNJ)
# ===========================================

import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, date
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class DataJudService:
    """Serviço para integração com a API DataJud do CNJ."""
    
    def __init__(self):
        self.base_url = settings.DATAJUD_BASE_URL if hasattr(settings, 'DATAJUD_BASE_URL') else "https://api.datajud.cnj.jus.br"
        self.api_token = settings.DATAJUD_API_TOKEN if hasattr(settings, 'DATAJUD_API_TOKEN') else None
        self.timeout = settings.DATAJUD_TIMEOUT if hasattr(settings, 'DATAJUD_TIMEOUT') else 30
        
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Sistema-Gestao-Processos/1.0"
        }
        
        if self.api_token:
            self.headers["Authorization"] = f"Bearer {self.api_token}"
    
    async def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Fazer requisição para a API DataJud."""
        
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    **kwargs
                )
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                logger.error(f"Timeout na requisição para DataJud: {url}")
                raise Exception("Timeout na consulta à API DataJud")
            
            except httpx.HTTPStatusError as e:
                logger.error(f"Erro HTTP na API DataJud: {e.response.status_code} - {e.response.text}")
                raise Exception(f"Erro na API DataJud: {e.response.status_code}")
            
            except Exception as e:
                logger.error(f"Erro na requisição para DataJud: {e}")
                raise Exception(f"Erro na comunicação com DataJud: {str(e)}")
    
    async def search_process_by_number(self, process_number: str) -> Optional[Dict[str, Any]]:
        """Buscar processo pelo número."""
        
        try:
            # Limpar número do processo (remover caracteres especiais)
            clean_number = ''.join(filter(str.isdigit, process_number))
            
            if len(clean_number) < 15:  # Número CNJ tem pelo menos 15 dígitos
                raise Exception("Número de processo inválido")
            
            # Endpoint fictício - adaptar conforme documentação real da API
            endpoint = f"api/v1/processos/{clean_number}"
            
            result = await self._make_request("GET", endpoint)
            
            return {
                "numero": result.get("numero"),
                "classe": result.get("classe"),
                "assunto": result.get("assunto"),
                "tribunal": result.get("tribunal"),
                "orgao_julgador": result.get("orgaoJulgador"),
                "data_ajuizamento": result.get("dataAjuizamento"),
                "valor_causa": result.get("valorCausa"),
                "partes": result.get("partes", []),
                "movimentacoes": result.get("movimentacoes", []),
                "status": result.get("status"),
                "ultima_atualizacao": result.get("ultimaAtualizacao")
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar processo {process_number}: {e}")
            return None
    
    async def get_process_movements(self, process_number: str, start_date: Optional[date] = None) -> List[Dict[str, Any]]:
        """Obter movimentações de um processo."""
        
        try:
            clean_number = ''.join(filter(str.isdigit, process_number))
            endpoint = f"api/v1/processos/{clean_number}/movimentacoes"
            
            params = {}
            if start_date:
                params["dataInicio"] = start_date.strftime("%Y-%m-%d")
            
            result = await self._make_request("GET", endpoint, params=params)
            
            movements = []
            for mov in result.get("movimentacoes", []):
                movements.append({
                    "codigo": mov.get("codigo"),
                    "nome": mov.get("nome"),
                    "data": mov.get("data"),
                    "complemento": mov.get("complemento"),
                    "tipo": mov.get("tipo")
                })
            
            return movements
            
        except Exception as e:
            logger.error(f"Erro ao buscar movimentações do processo {process_number}: {e}")
            return []
    
    async def search_processes_by_cpf_cnpj(self, document: str) -> List[Dict[str, Any]]:
        """Buscar processos por CPF/CNPJ."""
        
        try:
            # Limpar documento
            clean_doc = ''.join(filter(str.isdigit, document))
            
            endpoint = f"api/v1/processos/documento/{clean_doc}"
            
            result = await self._make_request("GET", endpoint)
            
            processes = []
            for proc in result.get("processos", []):
                processes.append({
                    "numero": proc.get("numero"),
                    "classe": proc.get("classe"),
                    "assunto": proc.get("assunto"),
                    "tribunal": proc.get("tribunal"),
                    "data_ajuizamento": proc.get("dataAjuizamento"),
                    "status": proc.get("status"),
                    "parte_no_processo": proc.get("parteNoProcesso")  # autor, réu, etc.
                })
            
            return processes
            
        except Exception as e:
            logger.error(f"Erro ao buscar processos por documento {document}: {e}")
            return []
    
    async def get_tribunal_info(self, tribunal_code: str) -> Optional[Dict[str, Any]]:
        """Obter informações de um tribunal."""
        
        try:
            endpoint = f"api/v1/tribunais/{tribunal_code}"
            
            result = await self._make_request("GET", endpoint)
            
            return {
                "codigo": result.get("codigo"),
                "nome": result.get("nome"),
                "sigla": result.get("sigla"),
                "tipo": result.get("tipo"),
                "endereco": result.get("endereco"),
                "telefone": result.get("telefone"),
                "email": result.get("email"),
                "site": result.get("site")
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar tribunal {tribunal_code}: {e}")
            return None
    
    async def validate_process_number(self, process_number: str) -> bool:
        """Validar número de processo pelo algoritmo do CNJ."""
        
        try:
            # Remover caracteres especiais
            clean_number = ''.join(filter(str.isdigit, process_number))
            
            if len(clean_number) != 20:
                return False
            
            # Algoritmo de validação do CNJ
            # Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
            # N = número sequencial
            # DD = dígitos verificadores
            # AAAA = ano
            # J = segmento do poder judiciário
            # TR = tribunal
            # OOOO = origem
            
            # Extrair partes
            sequential = clean_number[:7]
            check_digits = clean_number[7:9]
            year = clean_number[9:13]
            segment = clean_number[13:14]
            tribunal = clean_number[14:16]
            origin = clean_number[16:20]
            
            # Validar ano (deve ser razoável)
            current_year = datetime.now().year
            if not (1900 <= int(year) <= current_year + 1):
                return False
            
            # Calcular dígitos verificadores
            weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2, 3]
            digits = sequential + year + segment + tribunal + origin
            
            total = sum(int(digit) * weight for digit, weight in zip(digits, weights))
            remainder = total % 97
            calculated_check = 98 - remainder
            
            return f"{calculated_check:02d}" == check_digits
            
        except Exception as e:
            logger.error(f"Erro ao validar número do processo {process_number}: {e}")
            return False
    
    async def get_process_classes(self) -> List[Dict[str, Any]]:
        """Obter lista de classes processuais."""
        
        try:
            endpoint = "api/v1/tabelas/classes"
            
            result = await self._make_request("GET", endpoint)
            
            classes = []
            for cls in result.get("classes", []):
                classes.append({
                    "codigo": cls.get("codigo"),
                    "nome": cls.get("nome"),
                    "tipo": cls.get("tipo")
                })
            
            return classes
            
        except Exception as e:
            logger.error(f"Erro ao buscar classes processuais: {e}")
            return []
    
    async def get_process_subjects(self) -> List[Dict[str, Any]]:
        """Obter lista de assuntos processuais."""
        
        try:
            endpoint = "api/v1/tabelas/assuntos"
            
            result = await self._make_request("GET", endpoint)
            
            subjects = []
            for subj in result.get("assuntos", []):
                subjects.append({
                    "codigo": subj.get("codigo"),
                    "nome": subj.get("nome"),
                    "pai": subj.get("pai")
                })
            
            return subjects
            
        except Exception as e:
            logger.error(f"Erro ao buscar assuntos processuais: {e}")
            return []
    
    async def check_api_status(self) -> Dict[str, Any]:
        """Verificar status da API DataJud."""
        
        try:
            endpoint = "api/v1/status"
            
            result = await self._make_request("GET", endpoint)
            
            return {
                "status": "online",
                "version": result.get("version", "unknown"),
                "timestamp": datetime.now().isoformat(),
                "response_time": result.get("responseTime"),
                "message": "API DataJud disponível"
            }
            
        except Exception as e:
            return {
                "status": "offline",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "message": "API DataJud indisponível"
            }
    
    def format_process_number(self, process_number: str) -> str:
        """Formatar número do processo no padrão CNJ."""
        
        clean_number = ''.join(filter(str.isdigit, process_number))
        
        if len(clean_number) != 20:
            return process_number
        
        # Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
        formatted = f"{clean_number[:7]}-{clean_number[7:9]}.{clean_number[9:13]}.{clean_number[13:14]}.{clean_number[14:16]}.{clean_number[16:20]}"
        
        return formatted

# Instância global do serviço
datajud_service = DataJudService()
