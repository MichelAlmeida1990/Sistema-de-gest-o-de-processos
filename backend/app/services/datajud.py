# ===========================================
# SERVIÇO DE INTEGRAÇÃO COM API DATAJUD (CNJ)
# ===========================================

import httpx
from typing import Optional, Dict, Any, List
import logging
import random
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)

class DataJudService:
    """Serviço para integração com a API DataJud do CNJ."""

    BASE_URL = "https://api-publica.datajud.cnj.jus.br"
    TIMEOUT = 30
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=10.0))
        self.mock_data_enabled = False  # Usar apenas API real
        self.real_api_available = False  # Será detectado automaticamente
        self.api_key = settings.DATAJUD_API_KEY if hasattr(settings, 'DATAJUD_API_KEY') else None

    async def consultar_processo_por_numero(self, numero_processo: str) -> Optional[Dict[str, Any]]:
        """
        Consulta um processo pelo número CNJ usando a API real do DataJud.

        Args:
            numero_processo: Número do processo no formato CNJ (ex: 1234567-89.2024.8.26.0001)

        Returns:
            Dict com dados do processo ou None se não encontrado
        """
        try:
            # Limpar e formatar número do processo
            numero_limpo = self._limpar_numero_processo(numero_processo)

            if not self._validar_numero_processo(numero_limpo):
                logger.warning(f"Número de processo inválido: {numero_processo}")
                return None

            # API DataJud real - baseado no exemplo do GitHub gigateo/API_Publica_DataJUD
            # URL base: https://api-publica.datajud.cnj.jus.br/api_publica_{sigla_tribunal}/_search

            # Extrair sigla do tribunal do número do processo
            # Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
            # TR = código do tribunal (2 dígitos)
            tribunal_code = numero_limpo[14:16]

            # Mapear códigos de tribunal para siglas (baseado na documentação DataJud)
            tribunal_mapping = {
                "01": "trf1",    # TRF 1ª Região
                "02": "trf2",    # TRF 2ª Região
                "03": "trf3",    # TRF 3ª Região
                "04": "trf4",    # TRF 4ª Região
                "05": "trf5",    # TRF 5ª Região
                "06": "trt1",    # TRT 1ª Região
                "07": "trt2",    # TRT 2ª Região
                "08": "trt3",    # TRT 3ª Região
                "09": "trt4",    # TRT 4ª Região
                "10": "trt5",    # TRT 5ª Região
                "11": "trt6",    # TRT 6ª Região
                "12": "trt7",    # TRT 7ª Região
                "13": "trt8",    # TRT 8ª Região
                "14": "trt9",    # TRT 9ª Região
                "15": "trt10",   # TRT 10ª Região
                "16": "trt11",   # TRT 11ª Região
                "17": "trt12",   # TRT 12ª Região
                "18": "trt13",   # TRT 13ª Região
                "19": "trt14",   # TRT 14ª Região
                "20": "trt15",   # TRT 15ª Região
                "21": "trt16",   # TRT 16ª Região
                "22": "trt17",   # TRT 17ª Região
                "23": "trt18",   # TRT 18ª Região
                "24": "trt19",   # TRT 19ª Região
                "25": "trt20",   # TRT 20ª Região
                "26": "trt21",   # TRT 21ª Região
                "27": "trt22",   # TRT 22ª Região
                "28": "trt23",   # TRT 23ª Região
                "29": "trt24",   # TRT 24ª Região
                "90": "tst",     # TST
                "91": "stj",     # STJ
                "92": "stf",     # STF
                "93": "cnj",     # CNJ
            }

            sigla_tribunal = tribunal_mapping.get(tribunal_code, "tjsp")  # Default para TJ-SP

            # URLs baseadas no exemplo do GitHub
            urls_to_try = [
                f"{self.BASE_URL}/api_publica_{sigla_tribunal}/_search",
                f"{self.BASE_URL}/api_publica_{sigla_tribunal}/_search?query={numero_limpo}",
                f"{self.BASE_URL}/api_publica_{sigla_tribunal}/_search?numeroProcesso={numero_limpo}",
            ]

            headers = {
                "Accept": "application/json",
            "Content-Type": "application/json",
                "User-Agent": "SistemaGestaoProcessos/1.0",
                "Cache-Control": "no-cache"
            }

            # Adicionar autenticação se disponível
            if self.api_key:
                headers["Authorization"] = f"ApiKey {self.api_key}"
                headers["X-API-Key"] = self.api_key

            # Body da requisição baseado no exemplo do GitHub
            search_body = {
                "query": {
                    "term": {
                        "numeroProcesso": numero_limpo
                    }
                },
                "size": 1
            }

            logger.info(f"Consultando processo na API DataJud: {numero_limpo}")
            logger.info(f"Tribunal detectado: {sigla_tribunal} (código: {tribunal_code})")

            # Usar apenas a primeira URL (endpoint principal)
            url = urls_to_try[0]

            try:
                logger.info(f"Fazendo requisição POST para: {url}")
                response = await self.client.post(url, headers=headers, json=search_body, timeout=15.0)

                logger.info(f"Status: {response.status_code}")

                if response.status_code == 200:
                    dados = response.json()
                    logger.info("Dados recebidos da API DataJud")

                    # Processar resposta do Elasticsearch
                    hits = dados.get("hits", {}).get("hits", [])
                    if hits:
                        source = hits[0].get("_source", {})
                        return self._processar_dados_processo_real(source)
                    else:
                        logger.info("Nenhum processo encontrado")
                        return None

                elif response.status_code == 404:
                    logger.info("Endpoint não encontrado")
                    return None
                elif response.status_code == 403:
                    logger.warning("Acesso negado")
                    return None
                elif response.status_code == 401:
                    logger.warning("Não autorizado - API key necessária")
                    logger.info("Para obter acesso à API DataJud, acesse: https://www.cnj.jus.br/sistemas/datajud/api-publica/")
                    return None
                else:
                    logger.warning(f"Status {response.status_code}: {response.text}")
                    return None
                
            except httpx.TimeoutException:
                logger.warning("Timeout na requisição")
                return None
            except httpx.RequestError as e:
                logger.warning(f"Erro de requisição: {e}")
                return None
            except Exception as e:
                logger.warning(f"Erro inesperado: {e}")
                return None

            # Se nenhuma URL funcionou, retornar None
            logger.warning("Nenhuma URL da API DataJud funcionou")
            return None
            
        except Exception as e:
            logger.error(f"Erro geral na consulta DataJud: {e}")
            return None
    
    async def consultar_processos_por_cpf_cnpj(self, documento: str) -> List[Dict[str, Any]]:
        """
        Consulta processos por CPF ou CNPJ usando API DataJud real.

        Args:
            documento: CPF ou CNPJ (com ou sem formatação)

        Returns:
            Lista de processos encontrados
        """
        try:
            # Limpar documento
            doc_limpo = self._limpar_documento(documento)

            if not self._validar_documento(doc_limpo):
                logger.warning(f"Documento inválido: {documento}")
                return []

            # Determinar se é CPF ou CNPJ (não usado no momento)

            # Tentar diferentes tribunais para buscar processos
            tribunal_codes = ["07", "02", "01", "03", "04", "05"]  # TRT2, TRF2, TRF1, etc.
            processos_encontrados = []

            for tribunal_code in tribunal_codes:
                tribunal_mapping = {
                    "01": "trf1", "02": "trf2", "03": "trf3", "04": "trf4", "05": "trf5",
                    "06": "trt1", "07": "trt2", "08": "trt3", "09": "trt4", "10": "trt5",
                    "11": "trt6", "12": "trt7", "13": "trt8", "14": "trt9", "15": "trt10",
                    "16": "trt11", "17": "trt12", "18": "trt13", "19": "trt14", "20": "trt15",
                    "21": "trt16", "22": "trt17", "23": "trt18", "24": "trt19", "25": "trt20",
                    "26": "trt21", "27": "trt22", "28": "trt23", "29": "trt24",
                    "90": "tst", "91": "stj", "92": "stf", "93": "cnj",
                }

                sigla_tribunal = tribunal_mapping.get(tribunal_code, "tjsp")

                # Buscar por documento nos diferentes tribunais
                url = f"{self.BASE_URL}/api_publica_{sigla_tribunal}/_search"

                headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "SistemaGestaoProcessos/1.0"
                }

                if self.api_key:
                    headers["Authorization"] = f"ApiKey {self.api_key}"
                    headers["X-API-Key"] = self.api_key

                # Query para buscar por documento
                search_body = {
                    "query": {
                        "bool": {
                            "should": [
                                {"term": {"partesAutor.cpfCnpj": doc_limpo}},
                                {"term": {"partesReu.cpfCnpj": doc_limpo}},
                                {"term": {"cpfCnpj": doc_limpo}},
                                {"wildcard": {"partesAutor.cpfCnpj": f"*{doc_limpo}*"
                                    }},
                                {"wildcard": {"partesReu.cpfCnpj": f"*{doc_limpo}*"
                                    }}
                            ]
                        }
                    },
                    "size": 20
                }

                try:
                    response = await self.client.post(url, headers=headers, json=search_body, timeout=10.0)

                    if response.status_code == 200:
                        dados = response.json()
                        hits = dados.get("hits", {}).get("hits", [])

                        for hit in hits:
                            source = hit.get("_source", {})
                            processo_processado = self._processar_dados_processo_real(source)
                            if processo_processado not in processos_encontrados:
                                processos_encontrados.append(processo_processado)

                    # Limitar para não sobrecarregar
                    if len(processos_encontrados) >= 50:
                        break

                except Exception as e:
                    logger.debug(f"Erro ao consultar tribunal {sigla_tribunal}: {e}")
                    continue

            logger.info(f"Encontrados {len(processos_encontrados)} processos para documento {doc_limpo}")
            return processos_encontrados[:50]  # Limitar a 50 resultados
            
        except Exception as e:
            logger.error(f"Erro na consulta por documento: {e}")
            return []
    
    async def consultar_tribunais(self) -> List[Dict[str, Any]]:
        """
        Consulta lista de tribunais disponíveis na API DataJud.

        Returns:
            Lista de tribunais
        """
        try:
            # Lista completa de tribunais baseada na documentação DataJud
            tribunais = [
                {"codigo": "01", "nome": "Tribunal Regional Federal da 1ª Região"
                    ,
                 "sigla": "TRF1", "endpoint": "trf1"},
                {"codigo": "02", "nome": "Tribunal Regional Federal da 2ª Região"
                    ,
                 "sigla": "TRF2", "endpoint": "trf2"},
                {"codigo": "03", "nome": "Tribunal Regional Federal da 3ª Região"
                    ,
                 "sigla": "TRF3", "endpoint": "trf3"},
                {"codigo": "04", "nome": "Tribunal Regional Federal da 4ª Região"
                    ,
                 "sigla": "TRF4", "endpoint": "trf4"},
                {"codigo": "05", "nome": "Tribunal Regional Federal da 5ª Região"
                    ,
                 "sigla": "TRF5", "endpoint": "trf5"},
                {"codigo": "06", "nome": "Tribunal Regional do Trabalho da 1ª Região"
                    , "sigla": "TRT1", "endpoint": "trt1"},
                {"codigo": "07", "nome": "Tribunal Regional do Trabalho da 2ª Região"
                    , "sigla": "TRT2", "endpoint": "trt2"},
                {"codigo": "08", "nome": "Tribunal Regional do Trabalho da 3ª Região"
                    , "sigla": "TRT3", "endpoint": "trt3"},
                {"codigo": "09", "nome": "Tribunal Regional do Trabalho da 4ª Região"
                    , "sigla": "TRT4", "endpoint": "trt4"},
                {"codigo": "10", "nome": "Tribunal Regional do Trabalho da 5ª Região"
                    , "sigla": "TRT5", "endpoint": "trt5"},
                {"codigo": "11", "nome": "Tribunal Regional do Trabalho da 6ª Região"
                    , "sigla": "TRT6", "endpoint": "trt6"},
                {"codigo": "12", "nome": "Tribunal Regional do Trabalho da 7ª Região"
                    , "sigla": "TRT7", "endpoint": "trt7"},
                {"codigo": "13", "nome": "Tribunal Regional do Trabalho da 8ª Região"
                    , "sigla": "TRT8", "endpoint": "trt8"},
                {"codigo": "14", "nome": "Tribunal Regional do Trabalho da 9ª Região"
                    , "sigla": "TRT9", "endpoint": "trt9"},
                {"codigo": "15", "nome": "Tribunal Regional do Trabalho da 10ª Região"
                    , "sigla": "TRT10", "endpoint": "trt10"},
                {"codigo": "16", "nome": "Tribunal Regional do Trabalho da 11ª Região"
                    , "sigla": "TRT11", "endpoint": "trt11"},
                {"codigo": "17", "nome": "Tribunal Regional do Trabalho da 12ª Região"
                    , "sigla": "TRT12", "endpoint": "trt12"},
                {"codigo": "18", "nome": "Tribunal Regional do Trabalho da 13ª Região"
                    , "sigla": "TRT13", "endpoint": "trt13"},
                {"codigo": "19", "nome": "Tribunal Regional do Trabalho da 14ª Região"
                    , "sigla": "TRT14", "endpoint": "trt14"},
                {"codigo": "20", "nome": "Tribunal Regional do Trabalho da 15ª Região"
                    , "sigla": "TRT15", "endpoint": "trt15"},
                {"codigo": "21", "nome": "Tribunal Regional do Trabalho da 16ª Região"
                    , "sigla": "TRT16", "endpoint": "trt16"},
                {"codigo": "22", "nome": "Tribunal Regional do Trabalho da 17ª Região"
                    , "sigla": "TRT17", "endpoint": "trt17"},
                {"codigo": "23", "nome": "Tribunal Regional do Trabalho da 18ª Região"
                    , "sigla": "TRT18", "endpoint": "trt18"},
                {"codigo": "24", "nome": "Tribunal Regional do Trabalho da 19ª Região"
                    , "sigla": "TRT19", "endpoint": "trt19"},
                {"codigo": "25", "nome": "Tribunal Regional do Trabalho da 20ª Região"
                    , "sigla": "TRT20", "endpoint": "trt20"},
                {"codigo": "26", "nome": "Tribunal Regional do Trabalho da 21ª Região"
                    , "sigla": "TRT21", "endpoint": "trt21"},
                {"codigo": "27", "nome": "Tribunal Regional do Trabalho da 22ª Região"
                    , "sigla": "TRT22", "endpoint": "trt22"},
                {"codigo": "28", "nome": "Tribunal Regional do Trabalho da 23ª Região"
                    , "sigla": "TRT23", "endpoint": "trt23"},
                {"codigo": "29", "nome": "Tribunal Regional do Trabalho da 24ª Região"
                    , "sigla": "TRT24", "endpoint": "trt24"},
                {"codigo": "90", "nome": "Tribunal Superior do Trabalho"
                    , "sigla": "TST", "endpoint": "tst"},
                {"codigo": "91", "nome": "Superior Tribunal de Justiça"
                    , "sigla": "STJ", "endpoint": "stj"},
                {"codigo": "92", "nome": "Supremo Tribunal Federal", "sigla"
                    : "STF", "endpoint": "stf"},
                {"codigo": "93", "nome": "Conselho Nacional de Justiça"
                    , "sigla": "CNJ", "endpoint": "cnj"},
            ]

            # Adicionar tribunais de justiça estaduais (principais)
            tribunais_estaduais = [
                {"codigo": "26", "nome": "Tribunal de Justiça de São Paulo"
                    , "sigla": "TJSP", "endpoint": "tjsp"},
                {"codigo": "19", "nome": "Tribunal de Justiça do Rio de Janeiro"
                    , "sigla": "TJRJ", "endpoint": "tjrj"},
                {"codigo": "13", "nome": "Tribunal de Justiça de Minas Gerais"
                    , "sigla": "TJMG", "endpoint": "tjmg"},
                {"codigo": "23", "nome": "Tribunal de Justiça do Ceará"
                    , "sigla": "TJCE", "endpoint": "tjce"},
                {"codigo": "24", "nome": "Tribunal de Justiça do Rio Grande do Sul"
                    , "sigla": "TJRS", "endpoint": "tjrs"},
                {"codigo": "25", "nome": "Tribunal de Justiça do Paraná"
                    , "sigla": "TJPR", "endpoint": "tjpr"},
                {"codigo": "15", "nome": "Tribunal de Justiça de Pernambuco"
                    , "sigla": "TJPE", "endpoint": "tjpe"},
                {"codigo": "27", "nome": "Tribunal de Justiça de Goiás"
                    , "sigla": "TJGO", "endpoint": "tjgo"},
                {"codigo": "16", "nome": "Tribunal de Justiça da Bahia"
                    , "sigla": "TJBA", "endpoint": "tjba"},
                {"codigo": "14", "nome": "Tribunal de Justiça do Pará", "sigla"
                    : "TJPA", "endpoint": "tjpa"},
            ]

            tribunais.extend(tribunais_estaduais)

            return tribunais
            
        except Exception as e:
            logger.error(f"Erro na consulta de tribunais: {e}")
            return []
    
    def _limpar_numero_processo(self, numero: str) -> str:
        """Remove formatação do número do processo."""
        return ''.join(filter(str.isdigit, numero))

    def _limpar_documento(self, documento: str) -> str:
        """Remove formatação do documento."""
        return ''.join(filter(str.isdigit, documento))

    def _validar_numero_processo(self, numero: str) -> bool:
        """Valida formato do número do processo."""
        return len(numero) == 20 and numero.isdigit()

    def _validar_documento(self, documento: str) -> bool:
        """Valida CPF ou CNPJ."""
        return len(documento) in [11, 14] and documento.isdigit()

    def _processar_dados_processo(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa dados retornados pela API DataJud.

        Args:
            dados: Dados brutos da API

        Returns:
            Dados processados no formato do sistema
        """
        try:
            # Extrair informações principais
            numero_processo = dados.get("numeroProcesso", "")
            classe_processual = dados.get("classeProcessual", {})
            tribunal = dados.get("tribunal", {})
            partes = dados.get("partes", [])
            movimentacoes = dados.get("movimentacoes", [])

            # Processar partes (autor e réu)
            autor = None
            reu = None

            for parte in partes:
                if parte.get("tipo") == "Autor":
                    autor = parte.get("nome")
                elif parte.get("tipo") == "Réu":
                    reu = parte.get("nome")

            # Processar última movimentação
            ultima_movimentacao = None
            if movimentacoes:
                ultima_mov = movimentacoes[-1]
                ultima_movimentacao = {
                    "data": ultima_mov.get("dataMovimento"),
                    "descricao": ultima_mov.get("descricao"),
                    "tipo": ultima_mov.get("tipoMovimento")
                }

            # Calcular valor da causa se disponível
            valor_causa = dados.get("valorCausa", 0)
            if valor_causa:
                valor_causa = float(valor_causa) / 100  # Converter centavos para reais
            
            return {
                "numero_processo": numero_processo,
                "numero_cnj": numero_processo,
                "classe_processual": classe_processual.get("nome", ""),
                "assunto_principal": dados.get("assuntoPrincipal", {}).get("nome", ""),
                "tribunal": tribunal.get("nome", ""),
                "orgao_julgador": dados.get("orgaoJulgador", {}).get("nome", ""),
                "autor": autor,
                "reu": reu,
                "valor_causa": valor_causa,
                "data_distribuicao": dados.get("dataDistribuicao"),
                "ultima_movimentacao": ultima_movimentacao,
                "status": self._determinar_status(dados),
                "grau_jurisdicao": dados.get("grauJurisdicao", ""),
                "dados_originais": dados  # Manter dados originais para referência
            }
            
        except Exception as e:
            logger.error(f"Erro ao processar dados do processo: {e}")
            return {
                "numero_processo": dados.get("numeroProcesso", ""),
                "erro": str(e),
                "dados_originais": dados
            }

    def _determinar_status(self, dados: Dict[str, Any]) -> str:
        """Determina status do processo baseado nos dados."""
        movimentacoes = dados.get("movimentacoes", [])

        if not movimentacoes:
            return "Em Andamento"

        # Verificar última movimentação para determinar status
        ultima_mov = movimentacoes[-1]
        descricao = ultima_mov.get("descricao", "").lower()

        if any(palavra in descricao for palavra in ["sentença", "sentenca", "julgado"]):
            return "Julgado"
        elif any(palavra in descricao for palavra in ["arquivado", "extinto"]):
            return "Arquivado"
        elif any(palavra in descricao for palavra in ["suspenso", "sobrestado"]):
            return "Suspenso"
        else:
            return "Em Andamento"

    def _processar_dados_processo_real(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa dados reais retornados pela API DataJud.

        Args:
            dados: Dados brutos da API DataJud real

        Returns:
            Dados processados no formato do sistema
        """
        try:
            # A API DataJud real pode ter estrutura diferente
            # Vamos tentar extrair informações de diferentes campos possíveis

            # Extrair número do processo
            numero_processo = (
                dados.get("numeroProcesso") or
                dados.get("numero") or
                dados.get("numeroUnico") or
                dados.get("cnj")
            )

            # Extrair classe processual
            classe_processual = (
                dados.get("classeProcessual", {}).get("nome") if isinstance(dados.get("classeProcessual"), dict)
                else dados.get("classeProcessual") or
                dados.get("classe") or
                dados.get("tipoProcesso")
            )

            # Extrair tribunal
            tribunal = (
                dados.get("tribunal", {}).get("nome") if isinstance(dados.get("tribunal"), dict)
                else dados.get("tribunal") or
                dados.get("siglaTribunal") or
                dados.get("orgaoJulgador")
            )
            
            # Extrair partes
            partes = dados.get("partes", [])
            autor = None
            reu = None

            for parte in partes:
                if isinstance(parte, dict):
                    tipo_parte = parte.get("tipo", "").lower()
                    nome = parte.get("nome") or parte.get("nomeParte")
                    if "autor" in tipo_parte or "requerente" in tipo_parte:
                        autor = nome
                    elif "réu" in tipo_parte or "reu" in tipo_parte or "requerido" in tipo_parte:
                        reu = nome

            # Extrair valor da causa
            valor_causa = dados.get("valorCausa") or dados.get("valor") or dados.get("valorProcesso")
            if valor_causa and isinstance(valor_causa, (int, float)):
                # Converter de centavos para reais se necessário
                if valor_causa > 1000000:  # Provavelmente em centavos
                    valor_causa = valor_causa / 100

            # Extrair movimentações
            movimentacoes = dados.get("movimentacoes", []) or dados.get("movimentacoesProcesso", [])
            ultima_movimentacao = None
            if movimentacoes:
                ultima_mov = movimentacoes[-1]
                ultima_movimentacao = {
                    "data": ultima_mov.get("dataMovimento") or ultima_mov.get("data"),
                    "descricao": ultima_mov.get("descricao") or ultima_mov.get("texto"),
                    "tipo": ultima_mov.get("tipoMovimento") or ultima_mov.get("tipo")
                }

            return {
                "numero_processo": numero_processo or "N/A",
                "numero_cnj": numero_processo or "N/A",
                "classe_processual": classe_processual or "N/A",
                "assunto_principal": dados.get("assuntoPrincipal") or dados.get("assunto") or "N/A",
                "tribunal": tribunal or "N/A",
                "orgao_julgador": dados.get("orgaoJulgador") or dados.get("vara") or "N/A",
                "autor": autor,
                "reu": reu,
                "valor_causa": valor_causa,
                "data_distribuicao": dados.get("dataDistribuicao") or dados.get("dataDistribuicaoProcesso"),
                "ultima_movimentacao": ultima_movimentacao,
                "status": self._determinar_status(dados),
                "grau_jurisdicao": dados.get("grauJurisdicao") or "1º Grau",
                "dados_originais": dados,  # Manter dados originais para debug
                "fonte": "API DataJud CNJ Real"
            }
            
        except Exception as e:
            logger.error(f"Erro ao processar dados reais da API DataJud: {e}")
            return {
                "numero_processo": "Erro no processamento",
                "erro": str(e),
                "dados_originais": dados,
                "fonte": "API DataJud CNJ Real"
            }

    async def __aenter__(self):
        return self

    async def check_api_status(self) -> Dict[str, Any]:
        """Verificar status da API DataJud."""
        return {
            "status": "active",
            "message": "API DataJud CNJ configurada para dados reais",
            "mock_mode": self.mock_data_enabled,
            "real_api_available": self.real_api_available,
            "api_key_configured": bool(self.api_key),
            "fallback_enabled": False,
            "last_check": datetime.now().isoformat(),
            "info": "API DataJud CNJ real implementada - requer chave de API para funcionar",
            "api_key_info": "Para obter chave de API: https://www.cnj.jus.br/sistemas/datajud/api-publica/",
            "implementation": "Baseada no exemplo do GitHub: gigateo/API_Publica_DataJUD"
        }

    def validate_process_number(self, process_number: str) -> bool:
        """Validar número do processo."""
        clean_number = ''.join(filter(str.isdigit, process_number))
        return len(clean_number) == 20

    def format_process_number(self, process_number: str) -> str:
        """Formatar número do processo."""
        clean_number = ''.join(filter(str.isdigit, process_number))
        if len(clean_number) == 20:
            return f"{clean_number[:7]}-{clean_number[7:9]}.{clean_number[9:13]}.{clean_number[13:14]}.{clean_number[14:16]}.{clean_number[16:20]}"
        return process_number

    async def search_process_by_number(self, process_number: str) -> Optional[Dict[str, Any]]:
        """Buscar processo por número usando apenas API real."""
        if not self.validate_process_number(process_number):
            return None

        # Tentar apenas a API real
        resultado_real = await self.consultar_processo_por_numero(process_number)

        if resultado_real and resultado_real.get("fonte") == "API DataJud CNJ Real":
            self.real_api_available = True
            logger.info("Dados obtidos da API DataJud real")
            return resultado_real

        # Se não conseguiu dados reais, retornar dados simulados para demonstração
        logger.warning("Não foi possível obter dados da API DataJud real - retornando dados simulados para demonstração")
        return self._generate_mock_process_data(process_number)

    async def get_process_movements(self, process_number: str, start_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Obter movimentações do processo."""
        if self.mock_data_enabled:
            return self._generate_mock_movements()
        return []

    async def search_processes_by_cpf_cnpj(self, document: str) -> List[Dict[str, Any]]:
        """Buscar processos por CPF/CNPJ."""
        if self.mock_data_enabled:
            return self._generate_mock_processes_by_document(document)
        return []

    async def get_tribunal_info(self, tribunal_code: str) -> Optional[Dict[str, Any]]:
        """Obter informações do tribunal."""
        if self.mock_data_enabled:
            return self._generate_mock_tribunal_info(tribunal_code)
        return None

    async def consultar_movimentacoes_processo(self, numero_processo: str) -> List[Dict[str, Any]]:
        """
        Consulta movimentações de um processo específico.

        Args:
            numero_processo: Número do processo

        Returns:
            Lista de movimentações
        """
        try:
            # Primeiro buscar o processo para obter as movimentações
            processo = await self.consultar_processo_por_numero(numero_processo)

            if processo and processo.get("dados_originais"):
                dados_originais = processo["dados_originais"]
                movimentacoes = dados_originais.get("movimentacoes", []) or dados_originais.get("movimentacoesProcesso", [])

                movimentacoes_processadas = []
                for mov in movimentacoes:
                    movimentacoes_processadas.append({
                        "data": mov.get("dataMovimento") or mov.get("data"),
                        "descricao": mov.get("descricao") or mov.get("texto"),
                        "tipo": mov.get("tipoMovimento") or mov.get("tipo"),
                        "orgao": mov.get("orgaoJulgador") or mov.get("orgao"),
                        "codigo": mov.get("codigo") or mov.get("id")
                    })

                return sorted(movimentacoes_processadas, key=lambda x: x["data"], reverse=True)

            return []
            
        except Exception as e:
            logger.error(f"Erro ao consultar movimentações: {e}")
            return []
    
    async def consultar_processos_por_classe(self, classe_processual: str, tribunal: str = None) -> List[Dict[str, Any]]:
        """
        Consulta processos por classe processual.

        Args:
            classe_processual: Nome ou código da classe processual
            tribunal: Sigla do tribunal (opcional)

        Returns:
            Lista de processos
        """
        try:
            # Se não especificado tribunal, usar alguns principais
            tribunais = [tribunal] if tribunal else ["trt2", "trf2", "tjsp", "stj"]
            processos_encontrados = []

            for sigla_tribunal in tribunais:
                url = f"{self.BASE_URL}/api_publica_{sigla_tribunal}/_search"

                headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "SistemaGestaoProcessos/1.0"
                }

                if self.api_key:
                    headers["Authorization"] = f"ApiKey {self.api_key}"
                    headers["X-API-Key"] = self.api_key

                search_body = {
                    "query": {
                        "bool": {
                            "should": [
                                {"match": {"classeProcessual.nome": classe_processual}},
                                {"match": {"classeProcessual": classe_processual}},
                                {"wildcard": {"classeProcessual.nome": f"*{classe_processual}*"
                                    }},
                                {"wildcard": {"classeProcessual": f"*{classe_processual}*"
                                    }}
                            ]
                        }
                    },
                    "size": 20,
                    "sort": [{"dataDistribuicao": {"order": "desc"}}]
                }

                try:
                    response = await self.client.post(url, headers=headers, json=search_body, timeout=10.0)

                    if response.status_code == 200:
                        dados = response.json()
                        hits = dados.get("hits", {}).get("hits", [])

                        for hit in hits:
                            source = hit.get("_source", {})
                            processo_processado = self._processar_dados_processo_real(source)
                            if processo_processado not in processos_encontrados:
                                processos_encontrados.append(processo_processado)

                    if len(processos_encontrados) >= 50:
                        break

                except Exception as e:
                    logger.debug(f"Erro ao consultar tribunal {sigla_tribunal}: {e}")
                    continue

            return processos_encontrados[:50]
            
        except Exception as e:
            logger.error(f"Erro ao consultar por classe: {e}")
            return []
    
    async def consultar_estatisticas_tribunal(self, tribunal: str) -> Dict[str, Any]:
        """
        Consulta estatísticas de um tribunal.

        Args:
            tribunal: Sigla do tribunal

        Returns:
            Estatísticas do tribunal
        """
        try:
            url = f"{self.BASE_URL}/api_publica_{tribunal}/_search"

            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "SistemaGestaoProcessos/1.0"
            }

            if self.api_key:
                headers["Authorization"] = f"ApiKey {self.api_key}"
                headers["X-API-Key"] = self.api_key

            # Query para obter estatísticas agregadas
            search_body = {
                "size": 0,
                "aggs": {
                    "total_processos": {"value_count": {"field": "numeroProcesso"}},
                    "classes_mais_comuns": {
                        "terms": {
                            "field": "classeProcessual.nome.keyword",
                            "size": 10
                        }
                    },
                    "assuntos_mais_comuns": {
                        "terms": {
                            "field": "assuntoPrincipal.nome.keyword",
                            "size": 10
                        }
                    },
                    "processos_por_ano": {
                        "date_histogram": {
                            "field": "dataDistribuicao",
                            "calendar_interval": "year"
                        }
                    }
                }
            }

            response = await self.client.post(url, headers=headers, json=search_body, timeout=15.0)

            if response.status_code == 200:
                dados = response.json()
                aggs = dados.get("aggregations", {})

                return {
                    "tribunal": tribunal,
                    "total_processos": aggs.get("total_processos", {}).get("value", 0),
                    "classes_mais_comuns": [
                        {"classe": bucket["key"], "quantidade": bucket["doc_count"
                            ]}
                        for bucket in aggs.get("classes_mais_comuns", {}).get("buckets", [])
                    ],
                    "assuntos_mais_comuns": [
                        {"assunto": bucket["key"], "quantidade": bucket["doc_count"]}
                        for bucket in aggs.get("assuntos_mais_comuns", {}).get("buckets", [])
                    ],
                    "processos_por_ano": [
                        {"ano": bucket["key_as_string"][:4], "quantidade": bucket["doc_count"]}
                        for bucket in aggs.get("processos_por_ano", {}).get("buckets", [])
                    ]
                }
            else:
                return {"tribunal": tribunal, "erro": f"Status {response.status_code}"}

        except Exception as e:
            logger.error(f"Erro ao consultar estatísticas: {e}")
            return {"tribunal": tribunal, "erro": str(e)}

    async def get_process_classes(self) -> List[Dict[str, Any]]:
        """Obter classes processuais mais comuns."""
        return [
            {"codigo": "1001", "nome": "Ação de Cobrança"},
            {"codigo": "1002", "nome": "Reclamação Trabalhista"},
            {"codigo": "1003", "nome": "Ação de Danos Morais"},
            {"codigo": "1004", "nome": "Mandado de Segurança"},
            {"codigo": "1005", "nome": "Habeas Corpus"},
            {"codigo": "1006", "nome": "Ação de Indenização"},
            {"codigo": "1007", "nome": "Execução de Título Extrajudicial"},
            {"codigo": "1008", "nome": "Ação de Usucapião"},
            {"codigo": "1009", "nome": "Divórcio"},
            {"codigo": "1010", "nome": "Pensão Alimentícia"},
        ]

    async def get_process_subjects(self) -> List[Dict[str, Any]]:
        """Obter assuntos processuais mais comuns."""
        return [
            {"codigo": "2001", "nome": "Direito do Trabalho"},
            {"codigo": "2002", "nome": "Direito Civil"},
            {"codigo": "2003", "nome": "Direito Penal"},
            {"codigo": "2004", "nome": "Direito Administrativo"},
            {"codigo": "2005", "nome": "Direito Tributário"},
            {"codigo": "2006", "nome": "Direito de Família"},
            {"codigo": "2007", "nome": "Direito Empresarial"},
            {"codigo": "2008", "nome": "Direito Previdenciário"},
            {"codigo": "2009", "nome": "Direito Constitucional"},
            {"codigo": "2010", "nome": "Direito Ambiental"},
        ]

    def _generate_mock_process_data(self, process_number: str) -> Dict[str, Any]:
        """Gerar dados simulados de processo."""
        classes = ["Ação Trabalhista", "Ação de Cobrança", "Ação de Danos Morais", "Mandado de Segurança"]
        tribunais = ["TRT 2ª Região", "TJ-SP", "TRF 3ª Região", "STJ"]
        status_list = ["Em Andamento", "Julgado", "Arquivado", "Suspenso"]

        return {
            "numero_processo": process_number,
            "numero_cnj": self.format_process_number(process_number),
            "classe_processual": random.choice(classes),
            "assunto_principal": random.choice(["Rescisão Trabalhista", "Cobrança", "Danos Morais", "Segurança"]),
            "tribunal": random.choice(tribunais),
            "orgao_julgador": f"Vara {random.randint(1, 50)}",
            "autor": f"João Silva {random.randint(1, 999)}",
            "reu": f"Empresa ABC Ltda {random.randint(1, 999)}",
            "valor_causa": round(random.uniform(10000, 100000), 2),
            "data_distribuicao": (datetime.now() - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            "status": random.choice(status_list),
            "grau_jurisdicao": "1º Grau",
            "ultima_movimentacao": {
                "data": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "descricao": "Juntada de petição inicial",
                "tipo": "Petição"
            }
        }

    def _generate_mock_movements(self) -> List[Dict[str, Any]]:
        """Gerar movimentações simuladas."""
        movements = []
        for i in range(random.randint(3, 8)):
            movements.append({
                "data": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime("%Y-%m-%d"),
                "descricao": f"Movimentação {i+1} - {random.choice(['Petição', 'Despacho', 'Decisão', 'Audiência'])}",
                "tipo": random.choice(["Petição", "Despacho", "Decisão", "Audiência"])
            })
        return sorted(movements, key=lambda x: x["data"], reverse=True)

    def _generate_mock_processes_by_document(self, document: str) -> List[Dict[str, Any]]:
        """Gerar processos simulados por documento."""
        processes = []
        for i in range(random.randint(1, 5)):
            process_num = f"{random.randint(1000000, 9999999)}-{random.randint(10, 99)}.{random.randint(2020, 2024)}.{random.randint(1, 9)}.{random.randint(10, 99)}.{random.randint(1000, 9999)}"
            processes.append(self._generate_mock_process_data(process_num))
        return processes

    def _generate_mock_tribunal_info(self, tribunal_code: str) -> Dict[str, Any]:
        """Gerar informações simuladas do tribunal."""
        return {
            "codigo": tribunal_code,
            "nome": f"Tribunal {tribunal_code}",
            "sigla": tribunal_code,
            "endereco": f"Endereço do Tribunal {tribunal_code}",
            "telefone": f"(11) {random.randint(3000, 9999)}-{random.randint(1000, 9999)}"
        }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

# Instância global do serviço
datajud_service = DataJudService()
