# ===========================================
# SERVIÇO DE DIAGNÓSTICO JURÍDICO
# ===========================================

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.legal_diagnosis import LegalDiagnosis, DiagnosisStatus, DiagnosisPriority
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class LegalDiagnosisService:
    """Serviço para análise e diagnóstico jurídico de casos."""

    def __init__(self):
        self.ai_service = ai_service

    async def analyze_case(
        self,
        case_description: str,
        case_category: Optional[str] = None,
        case_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analisar um caso jurídico usando IA.

        Args:
            case_description: Descrição do caso
            case_category: Categoria do caso (ex: Trabalhista, Civil)
            case_type: Tipo do caso (ex: Rescisão, Cobrança)

        Returns:
            Análise completa do caso
        """
        try:
            # Prompt para análise jurídica
            prompt = f"""
            Analise o seguinte caso jurídico e forneça uma análise detalhada:

            Categoria: {case_category or 'Não especificada'}
            Tipo: {case_type or 'Não especificado'}
            
            Descrição do caso:
            {case_description}

            Por favor, forneça:
            1. Questões jurídicas chave identificadas
            2. Possíveis soluções legais
            3. Probabilidade de êxito (0-100%)
            4. Nível de risco (baixo, médio, alto)
            5. Recomendações estratégicas
            6. Valor estimado do caso (se aplicável)
            7. Duração estimada do processo (se aplicável)
            """

            # Usar IA para análise
            analysis_result = await self.ai_service.generate(
                prompt=prompt,
                max_length=1000,
                temperature=0.7
            )

            # Processar resultado da IA
            analysis_text = analysis_result.get("generated_text", "")

            # Extrair informações estruturadas
            key_issues = self._extract_key_issues(analysis_text, case_description)
            possible_solutions = self._extract_solutions(analysis_text)
            success_probability = self._extract_success_probability(analysis_text)
            risk_level = self._extract_risk_level(analysis_text)
            recommendations = self._extract_recommendations(analysis_text)
            estimated_value = self._extract_estimated_value(analysis_text)
            estimated_duration = self._extract_estimated_duration(analysis_text)

            return {
                "analysis": analysis_text,
                "key_issues": key_issues,
                "possible_solutions": possible_solutions,
                "success_probability": success_probability,
                "risk_level": risk_level,
                "recommendations": recommendations,
                "estimated_value": estimated_value,
                "estimated_duration": estimated_duration,
                "category": case_category,
                "type": case_type
            }

        except Exception as e:
            logger.error(f"Erro ao analisar caso: {e}")
            # Retornar análise básica em caso de erro
            return {
                "analysis": "Análise não disponível no momento.",
                "key_issues": [],
                "possible_solutions": [],
                "success_probability": 50.0,
                "risk_level": "medium",
                "recommendations": "Recomenda-se consulta com advogado especializado.",
                "estimated_value": None,
                "estimated_duration": None,
                "category": case_category,
                "type": case_type
            }

    def _extract_key_issues(self, analysis_text: str, case_description: str) -> List[str]:
        """Extrair questões chave da análise."""
        # Buscar por padrões como "questão", "problema", "ponto chave"
        issues = []
        
        # Análise simples baseada em palavras-chave
        keywords = ["questão", "problema", "ponto", "aspecto", "fato relevante"]
        
        sentences = analysis_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:  # Filtrar frases muito curtas
                    issues.append(sentence.strip())
        
        # Limitar a 5 questões principais
        return issues[:5] if issues else ["Análise detalhada recomendada"]

    def _extract_solutions(self, analysis_text: str) -> List[str]:
        """Extrair possíveis soluções."""
        solutions = []
        
        keywords = ["solução", "alternativa", "possibilidade", "recomendação", "ação"]
        
        sentences = analysis_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    solutions.append(sentence.strip())
        
        return solutions[:5] if solutions else ["Consulta com advogado especializado recomendada"]

    def _extract_success_probability(self, analysis_text: str) -> float:
        """Extrair probabilidade de êxito."""
        import re
        
        # Buscar padrões como "50%", "probabilidade de 70%", etc.
        patterns = [
            r"(\d+)%",
            r"probabilidade.*?(\d+)%",
            r"êxito.*?(\d+)%",
            r"sucesso.*?(\d+)%"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, analysis_text, re.IGNORECASE)
            if matches:
                try:
                    value = float(matches[0])
                    if 0 <= value <= 100:
                        return value
                except ValueError:
                    continue
        
        # Valor padrão se não encontrar
        return 50.0

    def _extract_risk_level(self, analysis_text: str) -> str:
        """Extrair nível de risco."""
        analysis_lower = analysis_text.lower()
        
        if any(word in analysis_lower for word in ["alto risco", "risco elevado", "perigoso", "crítico"]):
            return "high"
        elif any(word in analysis_lower for word in ["baixo risco", "risco baixo", "seguro", "favorável"]):
            return "low"
        else:
            return "medium"

    def _extract_recommendations(self, analysis_text: str) -> str:
        """Extrair recomendações."""
        # Buscar seção de recomendações
        if "recomendação" in analysis_text.lower() or "recomenda" in analysis_text.lower():
            # Tentar extrair parágrafo com recomendações
            sentences = analysis_text.split(".")
            recommendations = []
            
            for i, sentence in enumerate(sentences):
                if "recomend" in sentence.lower():
                    # Pegar algumas frases após a recomendação
                    recommendations.extend(sentences[i:i+3])
                    break
            
            if recommendations:
                return ". ".join(recommendations).strip()
        
        return "Recomenda-se análise detalhada do caso por advogado especializado."

    def _extract_estimated_value(self, analysis_text: str) -> Optional[float]:
        """Extrair valor estimado do caso."""
        import re
        
        # Buscar valores monetários
        patterns = [
            r"R\$\s*([\d.,]+)",
            r"valor.*?R\$\s*([\d.,]+)",
            r"estimado.*?R\$\s*([\d.,]+)"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, analysis_text, re.IGNORECASE)
            if matches:
                try:
                    value_str = matches[0].replace(".", "").replace(",", ".")
                    return float(value_str)
                except ValueError:
                    continue
        
        return None

    def _extract_estimated_duration(self, analysis_text: str) -> Optional[str]:
        """Extrair duração estimada."""
        import re
        
        # Buscar padrões de tempo
        patterns = [
            r"(\d+)\s*(meses?|anos?)",
            r"duração.*?(\d+)\s*(meses?|anos?)",
            r"prazo.*?(\d+)\s*(meses?|anos?)"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, analysis_text, re.IGNORECASE)
            if matches:
                number, unit = matches[0]
                return f"{number} {unit}"
        
        return None

    async def create_diagnosis(
        self,
        db: Session,
        client_name: str,
        case_description: str,
        client_email: Optional[str] = None,
        client_phone: Optional[str] = None,
        client_document: Optional[str] = None,
        case_category: Optional[str] = None,
        case_type: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> LegalDiagnosis:
        """
        Criar novo diagnóstico jurídico.

        Args:
            db: Sessão do banco de dados
            client_name: Nome do cliente
            case_description: Descrição do caso
            client_email: Email do cliente
            client_phone: Telefone do cliente
            client_document: Documento do cliente
            case_category: Categoria do caso
            case_type: Tipo do caso
            user_id: ID do advogado responsável

        Returns:
            Diagnóstico criado
        """
        # Criar diagnóstico
        diagnosis = LegalDiagnosis(
            client_name=client_name,
            client_email=client_email,
            client_phone=client_phone,
            client_document=client_document,
            case_description=case_description,
            case_category=case_category,
            case_type=case_type,
            status=DiagnosisStatus.ANALYZING,
            user_id=user_id
        )

        db.add(diagnosis)
        db.commit()
        db.refresh(diagnosis)

        # Realizar análise com IA
        try:
            analysis = await self.analyze_case(
                case_description=case_description,
                case_category=case_category,
                case_type=case_type
            )

            # Atualizar diagnóstico com resultados
            diagnosis.ai_analysis = analysis
            diagnosis.key_issues = analysis.get("key_issues", [])
            diagnosis.possible_solutions = analysis.get("possible_solutions", [])
            diagnosis.success_probability = analysis.get("success_probability", 50.0)
            diagnosis.risk_level = analysis.get("risk_level", "medium")
            diagnosis.recommendations = analysis.get("recommendations", "")
            diagnosis.estimated_value = analysis.get("estimated_value")
            diagnosis.estimated_duration = analysis.get("estimated_duration")
            diagnosis.status = DiagnosisStatus.COMPLETED

            # Definir prioridade baseada no risco e probabilidade
            if diagnosis.risk_level == "high" or diagnosis.success_probability < 30:
                diagnosis.priority = DiagnosisPriority.URGENT
            elif diagnosis.risk_level == "medium" or diagnosis.success_probability < 50:
                diagnosis.priority = DiagnosisPriority.HIGH
            elif diagnosis.success_probability > 70:
                diagnosis.priority = DiagnosisPriority.LOW
            else:
                diagnosis.priority = DiagnosisPriority.MEDIUM

        except Exception as e:
            logger.error(f"Erro ao analisar diagnóstico {diagnosis.id}: {e}")
            diagnosis.status = DiagnosisStatus.FAILED

        db.commit()
        db.refresh(diagnosis)

        return diagnosis

    def get_diagnosis(self, db: Session, diagnosis_id: int) -> Optional[LegalDiagnosis]:
        """Obter diagnóstico por ID."""
        return db.query(LegalDiagnosis).filter(LegalDiagnosis.id == diagnosis_id).first()

    def list_diagnoses(
        self,
        db: Session,
        user_id: Optional[int] = None,
        status: Optional[DiagnosisStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[LegalDiagnosis]:
        """Listar diagnósticos."""
        query = db.query(LegalDiagnosis)

        if user_id:
            query = query.filter(LegalDiagnosis.user_id == user_id)

        if status:
            query = query.filter(LegalDiagnosis.status == status)

        return query.order_by(LegalDiagnosis.created_at.desc()).offset(skip).limit(limit).all()


# Instância global do serviço
legal_diagnosis_service = LegalDiagnosisService()



