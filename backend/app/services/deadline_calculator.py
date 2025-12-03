# ===========================================
# SERVIÇO DE CÁLCULO DE PRAZOS PROCESSUAIS
# ===========================================

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pytz

logger = logging.getLogger(__name__)


class DeadlineCalculator:
    """Serviço para cálculo de prazos processuais."""

    # Feriados nacionais fixos (ano independente)
    FERIADOS_NACIONAIS = [
        (1, 1),   # Ano Novo
        (4, 21),  # Tiradentes
        (5, 1),   # Dia do Trabalhador
        (9, 7),   # Independência
        (10, 12), # Nossa Senhora Aparecida
        (11, 2),  # Finados
        (11, 15), # Proclamação da República
        (12, 25), # Natal
    ]

    # Feriados móveis (calculados anualmente)
    # Páscoa, Carnaval, etc. - podem ser calculados ou obtidos de API

    def __init__(self):
        self.timezone = pytz.timezone("America/Sao_Paulo")

    def calcular_prazo(
        self,
        data_inicial: datetime,
        numero_dias: int,
        tipo_prazo: str = "dias_uteis",
        tribunal: Optional[str] = None,
        incluir_feriados: bool = True,
        incluir_suspensoes: bool = True
    ) -> Dict[str, Any]:
        """
        Calcular prazo processual.

        Args:
            data_inicial: Data inicial do prazo
            numero_dias: Número de dias do prazo
            tipo_prazo: Tipo de prazo ("dias_uteis" ou "dias_corridos")
            tribunal: Sigla do tribunal (opcional, para regras específicas)
            incluir_feriados: Considerar feriados no cálculo
            incluir_suspensoes: Considerar suspensões judiciárias

        Returns:
            Dicionário com data final e informações do cálculo
        """
        try:
            # Garantir timezone
            if data_inicial.tzinfo is None:
                data_inicial = self.timezone.localize(data_inicial)
            else:
                data_inicial = data_inicial.astimezone(self.timezone)

            if tipo_prazo == "dias_corridos":
                data_final = self._calcular_dias_corridos(
                    data_inicial,
                    numero_dias,
                    incluir_feriados,
                    incluir_suspensoes
                )
            else:  # dias_uteis
                data_final = self._calcular_dias_uteis(
                    data_inicial,
                    numero_dias,
                    tribunal,
                    incluir_feriados,
                    incluir_suspensoes
                )

            # Calcular informações adicionais
            dias_totais = (data_final - data_inicial).days
            dias_uteis_calculados = self._contar_dias_uteis(
                data_inicial,
                data_final,
                incluir_feriados
            )

            return {
                "success": True,
                "data_inicial": data_inicial.isoformat(),
                "data_final": data_final.isoformat(),
                "numero_dias": numero_dias,
                "tipo_prazo": tipo_prazo,
                "tribunal": tribunal,
                "dias_totais": dias_totais,
                "dias_uteis": dias_uteis_calculados,
                "feriados_considerados": incluir_feriados,
                "suspensoes_consideradas": incluir_suspensoes,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Erro ao calcular prazo: {e}")
            raise

    def _calcular_dias_corridos(
        self,
        data_inicial: datetime,
        numero_dias: int,
        incluir_feriados: bool,
        incluir_suspensoes: bool
    ) -> datetime:
        """Calcular prazo em dias corridos."""
        data_final = data_inicial + timedelta(days=numero_dias)

        # Se não considerar feriados, apenas adicionar dias
        if not incluir_feriados and not incluir_suspensoes:
            return data_final

        # Ajustar para pular feriados se necessário
        # (Para dias corridos, geralmente não se pula, mas pode ser configurável)
        return data_final

    def _calcular_dias_uteis(
        self,
        data_inicial: datetime,
        numero_dias: int,
        tribunal: Optional[str],
        incluir_feriados: bool,
        incluir_suspensoes: bool
    ) -> datetime:
        """Calcular prazo em dias úteis."""
        data_atual = data_inicial
        dias_contados = 0

        while dias_contados < numero_dias:
            data_atual += timedelta(days=1)

            # Verificar se é dia útil
            if self._eh_dia_util(
                data_atual,
                incluir_feriados,
                incluir_suspensoes,
                tribunal
            ):
                dias_contados += 1

        return data_atual

    def _eh_dia_util(
        self,
        data: datetime,
        incluir_feriados: bool,
        incluir_suspensoes: bool,
        tribunal: Optional[str]
    ) -> bool:
        """Verificar se a data é dia útil."""
        # Verificar se é fim de semana
        if data.weekday() >= 5:  # Sábado (5) ou Domingo (6)
            return False

        # Verificar feriados nacionais
        if incluir_feriados:
            if self._eh_feriado_nacional(data):
                return False

        # Verificar suspensões judiciárias
        if incluir_suspensoes:
            if self._eh_suspensao_judiciaria(data, tribunal):
                return False

        return True

    def _eh_feriado_nacional(self, data: datetime) -> bool:
        """Verificar se a data é feriado nacional."""
        mes_dia = (data.month, data.day)
        return mes_dia in self.FERIADOS_NACIONAIS

    def _eh_suspensao_judiciaria(
        self,
        data: datetime,
        tribunal: Optional[str]
    ) -> bool:
        """
        Verificar se há suspensão judiciária.

        Nota: Implementação básica. Pode ser expandida com
        base de dados de suspensões por tribunal.
        """
        # Por enquanto, retornar False
        # Pode ser expandido com banco de dados de suspensões
        return False

    def _contar_dias_uteis(
        self,
        data_inicial: datetime,
        data_final: datetime,
        incluir_feriados: bool
    ) -> int:
        """Contar dias úteis entre duas datas."""
        count = 0
        data_atual = data_inicial

        while data_atual <= data_final:
            if self._eh_dia_util(
                data_atual,
                incluir_feriados,
                True,
                None
            ):
                count += 1
            data_atual += timedelta(days=1)

        return count

    def obter_feriados_ano(
        self,
        ano: int,
        tribunal: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Obter lista de feriados do ano.

        Args:
            ano: Ano para obter feriados
            tribunal: Tribunal específico (opcional)

        Returns:
            Lista de feriados
        """
        feriados = []

        # Feriados fixos
        for mes, dia in self.FERIADOS_NACIONAIS:
            feriados.append({
                "data": datetime(ano, mes, dia, tzinfo=self.timezone).isoformat(),
                "nome": self._nome_feriado(mes, dia),
                "tipo": "nacional",
                "tribunal": None
            })

        # TODO: Adicionar feriados móveis (Páscoa, Carnaval, etc.)
        # TODO: Adicionar feriados regionais por tribunal

        return feriados

    def _nome_feriado(self, mes: int, dia: int) -> str:
        """Obter nome do feriado."""
        nomes = {
            (1, 1): "Ano Novo",
            (4, 21): "Tiradentes",
            (5, 1): "Dia do Trabalhador",
            (9, 7): "Independência do Brasil",
            (10, 12): "Nossa Senhora Aparecida",
            (11, 2): "Finados",
            (11, 15): "Proclamação da República",
            (12, 25): "Natal",
        }
        return nomes.get((mes, dia), "Feriado")


# Instância global do serviço
deadline_calculator = DeadlineCalculator()



