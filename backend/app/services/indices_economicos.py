# ===========================================
# SERVIÇO DE ÍNDICES ECONÔMICOS (BANCO CENTRAL)
# ===========================================

import httpx
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.config import settings

logger = logging.getLogger(__name__)

class IndicesEconomicosService:
    """Serviço para integração com API de índices econômicos do Banco Central."""

    BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados"
    
    # Códigos das séries do Banco Central
    CODIGOS_SERIES = {
        "IPCA_E": 433,      # IPCA-E (Índice Nacional de Preços ao Consumidor Amplo - Especial)
        "IPCA": 433,        # IPCA (mesmo código)
        "INPC": 188,        # INPC (Índice Nacional de Preços ao Consumidor)
        "SELIC": 432,       # Taxa SELIC (meta)
        "SELIC_DIARIA": 11, # Taxa SELIC diária
        "TR": 226,          # Taxa Referencial (TR)
        "IGP_M": 189,       # IGP-M (Índice Geral de Preços - Mercado)
        "CDI": 12,          # CDI (Certificado de Depósito Interbancário)
    }
    
    TIMEOUT = 30
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=10.0))

    async def consultar_indice(
        self, 
        indice: str, 
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Consultar valores de um índice econômico.
        
        Args:
            indice: Nome do índice (IPCA_E, INPC, SELIC, TR, etc.)
            data_inicio: Data inicial no formato DD/MM/YYYY (opcional)
            data_fim: Data final no formato DD/MM/YYYY (opcional)
        
        Returns:
            Lista de valores do índice ou None
        """
        try:
            codigo = self.CODIGOS_SERIES.get(indice.upper())
            if not codigo:
                logger.warning(f"Índice não encontrado: {indice}")
                return None

            url = self.BASE_URL.format(codigo=codigo)
            
            # Construir parâmetros
            params = {}
            if data_inicio:
                params["dataInicial"] = data_inicio
            if data_fim:
                params["dataFinal"] = data_fim
            
            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "SistemaGestaoProcessos/1.0"
            }

            logger.info(f"Consultando índice {indice} (código {codigo})")
            response = await self.client.get(url, headers=headers, params=params, timeout=15.0)

            if response.status_code == 200:
                dados = response.json()
                logger.info(f"Dados recebidos do Banco Central para {indice}")
                return dados
            else:
                logger.warning(f"Erro ao consultar índice {indice}: {response.status_code}")
                return None
                
        except httpx.TimeoutException:
            logger.warning(f"Timeout ao consultar índice {indice}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Erro de requisição ao consultar índice {indice}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao consultar índice {indice}: {e}")
            return None

    async def obter_valor_indice_por_data(
        self, 
        indice: str, 
        data: str
    ) -> Optional[float]:
        """
        Obter valor de um índice em uma data específica.
        
        Args:
            indice: Nome do índice
            data: Data no formato DD/MM/YYYY
        
        Returns:
            Valor do índice na data ou None
        """
        try:
            dados = await self.consultar_indice(indice, data_inicio=data, data_fim=data)
            
            if dados and len(dados) > 0:
                # Retornar o primeiro valor encontrado (mais recente)
                valor = dados[0].get("valor")
                if valor:
                    return float(valor)
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao obter valor do índice {indice} na data {data}: {e}")
            return None

    async def calcular_atualizacao_precatorio(
        self,
        valor_origem: float,
        data_base: str,
        data_atualizacao: Optional[str] = None,
        indice: str = "IPCA_E"
    ) -> Dict[str, Any]:
        """
        Calcular atualização de valor de precatório usando índice econômico.
        
        Args:
            valor_origem: Valor original do precatório
            data_base: Data base do precatório (DD/MM/YYYY)
            data_atualizacao: Data para calcular atualização (DD/MM/YYYY). Se None, usa hoje
            indice: Índice a ser usado (IPCA_E, INPC, SELIC, TR)
        
        Returns:
            Dict com valor atualizado e detalhes do cálculo
        """
        try:
            if not data_atualizacao:
                data_atualizacao = datetime.now().strftime("%d/%m/%Y")
            
            # Obter valores do índice nas datas
            valor_base = await self.obter_valor_indice_por_data(indice, data_base)
            valor_atual = await self.obter_valor_indice_por_data(indice, data_atualizacao)
            
            if not valor_base or not valor_atual:
                return {
                    "sucesso": False,
                    "erro": f"Não foi possível obter valores do índice {indice}",
                    "valor_origem": valor_origem,
                    "valor_atualizado": valor_origem
                }
            
            # Calcular fator de atualização
            fator_atualizacao = valor_atual / valor_base
            
            # Calcular valor atualizado
            valor_atualizado = valor_origem * fator_atualizacao
            
            return {
                "sucesso": True,
                "valor_origem": valor_origem,
                "valor_atualizado": round(valor_atualizado, 2),
                "fator_atualizacao": round(fator_atualizacao, 6),
                "indice_usado": indice,
                "data_base": data_base,
                "data_atualizacao": data_atualizacao,
                "valor_indice_base": valor_base,
                "valor_indice_atual": valor_atual,
                "variacao_percentual": round((fator_atualizacao - 1) * 100, 2)
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular atualização: {e}")
            return {
                "sucesso": False,
                "erro": str(e),
                "valor_origem": valor_origem,
                "valor_atualizado": valor_origem
            }

    async def calcular_atualizacao_acumulada(
        self,
        valor_origem: float,
        data_base: str,
        data_atualizacao: Optional[str] = None,
        indice: str = "IPCA_E"
    ) -> Dict[str, Any]:
        """
        Calcular atualização acumulada mês a mês.
        
        Args:
            valor_origem: Valor original
            data_base: Data base (DD/MM/YYYY)
            data_atualizacao: Data final (DD/MM/YYYY)
            indice: Índice a ser usado
        
        Returns:
            Dict com histórico de atualização mês a mês
        """
        try:
            if not data_atualizacao:
                data_atualizacao = datetime.now().strftime("%d/%m/%Y")
            
            # Obter todos os valores do período
            dados = await self.consultar_indice(indice, data_inicio=data_base, data_fim=data_atualizacao)
            
            if not dados or len(dados) == 0:
                return {
                    "sucesso": False,
                    "erro": "Não foi possível obter dados do índice",
                    "valor_origem": valor_origem,
                    "valor_atualizado": valor_origem
                }
            
            # Ordenar por data (mais antigo primeiro)
            dados_ordenados = sorted(dados, key=lambda x: x.get("data", ""))
            
            valor_atual = valor_origem
            historico = []
            
            for registro in dados_ordenados:
                valor_indice = float(registro.get("valor", 0))
                data_registro = registro.get("data", "")
                
                if len(historico) == 0:
                    # Primeiro registro - usar como base
                    historico.append({
                        "data": data_registro,
                        "valor_indice": valor_indice,
                        "valor_atualizado": valor_origem,
                        "variacao_mensal": 0
                    })
                else:
                    # Calcular variação mensal
                    valor_indice_anterior = historico[-1]["valor_indice"]
                    variacao_mensal = (valor_indice / valor_indice_anterior) - 1
                    
                    # Atualizar valor
                    valor_atual = valor_atual * (1 + variacao_mensal)
                    
                    historico.append({
                        "data": data_registro,
                        "valor_indice": valor_indice,
                        "valor_atualizado": round(valor_atual, 2),
                        "variacao_mensal": round(variacao_mensal * 100, 2)
                    })
            
            return {
                "sucesso": True,
                "valor_origem": valor_origem,
                "valor_atualizado": round(valor_atual, 2),
                "indice_usado": indice,
                "data_base": data_base,
                "data_atualizacao": data_atualizacao,
                "historico": historico,
                "total_meses": len(historico)
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular atualização acumulada: {e}")
            return {
                "sucesso": False,
                "erro": str(e),
                "valor_origem": valor_origem,
                "valor_atualizado": valor_origem
            }

    async def obter_indices_disponiveis(self) -> List[Dict[str, Any]]:
        """Obter lista de índices disponíveis."""
        return [
            {
                "codigo": "IPCA_E",
                "nome": "IPCA-E (Índice Nacional de Preços ao Consumidor Amplo - Especial)",
                "descricao": "Usado para atualização de precatórios alimentares",
                "codigo_bcb": self.CODIGOS_SERIES["IPCA_E"]
            },
            {
                "codigo": "INPC",
                "nome": "INPC (Índice Nacional de Preços ao Consumidor)",
                "descricao": "Usado para atualização de precatórios comuns",
                "codigo_bcb": self.CODIGOS_SERIES["INPC"]
            },
            {
                "codigo": "SELIC",
                "nome": "Taxa SELIC",
                "descricao": "Taxa básica de juros da economia",
                "codigo_bcb": self.CODIGOS_SERIES["SELIC"]
            },
            {
                "codigo": "TR",
                "nome": "Taxa Referencial (TR)",
                "descricao": "Taxa referencial para atualização de valores",
                "codigo_bcb": self.CODIGOS_SERIES["TR"]
            },
            {
                "codigo": "IGP_M",
                "nome": "IGP-M (Índice Geral de Preços - Mercado)",
                "descricao": "Índice geral de preços",
                "codigo_bcb": self.CODIGOS_SERIES["IGP_M"]
            }
        ]

    async def check_api_status(self) -> Dict[str, Any]:
        """Verificar status da API do Banco Central."""
        try:
            # Tentar consultar IPCA-E do mês atual
            hoje = datetime.now().strftime("%d/%m/%Y")
            dados = await self.consultar_indice("IPCA_E", data_fim=hoje)
            
            return {
                "status": "active",
                "api_url": self.BASE_URL,
                "indices_disponiveis": len(self.CODIGOS_SERIES),
                "ultima_consulta": hoje,
                "dados_disponiveis": dados is not None and len(dados) > 0 if dados else False,
                "info": "API pública do Banco Central do Brasil - Sem autenticação necessária"
            }
        except Exception as e:
            return {
                "status": "error",
                "erro": str(e),
                "api_url": self.BASE_URL
            }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

# Instância global do serviço
indices_economicos_service = IndicesEconomicosService()

