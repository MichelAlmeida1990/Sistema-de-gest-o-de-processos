# ===========================================
# SERVIÇO DE ANÁLISE DE JURISPRUDÊNCIA
# ===========================================

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.jurisprudence import Jurisprudence, JurisprudenceChat, JurisprudenceStatus
from app.services.ai_service import ai_service
from app.services.datajud import datajud_service

logger = logging.getLogger(__name__)


class JurisprudenceService:
    """Serviço para análise e comparação de jurisprudências."""

    def __init__(self):
        self.ai_service = ai_service

    async def analyze_jurisprudence(
        self,
        text: str,
        process_number: Optional[str] = None,
        tribunal: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analisar uma jurisprudência usando IA.

        Args:
            text: Texto da decisão/jurisprudência
            process_number: Número do processo (opcional)
            tribunal: Tribunal (opcional)

        Returns:
            Análise completa da jurisprudência
        """
        try:
            # Prompt para análise jurídica
            prompt = f"""
            Analise a seguinte jurisprudência/decisão judicial e forneça uma análise detalhada:

            {'Processo: ' + process_number if process_number else ''}
            {'Tribunal: ' + tribunal if tribunal else ''}
            
            Texto da decisão:
            {text}

            Por favor, forneça:
            1. Resumo executivo da decisão
            2. Pontos chave identificados
            3. Fundamentação legal utilizada
            4. Argumentos estratégicos que podem ser extraídos
            5. Palavras-chave relevantes
            6. Contexto jurídico da decisão
            """

            # Usar IA para análise
            analysis_result = await self.ai_service.generate_text(
                prompt=prompt,
                max_length=1500,
                temperature=0.7
            )

            # Processar resultado da IA
            # O generate_text retorna: {"success": True, "generated_text": "...", ...}
            analysis_text = analysis_result.get("generated_text", "") if isinstance(analysis_result, dict) else str(analysis_result)

            # Extrair informações estruturadas
            summary = self._extract_summary(analysis_text, text)
            key_points = self._extract_key_points(analysis_text)
            legal_basis = self._extract_legal_basis(analysis_text)
            arguments = self._extract_arguments(analysis_text)
            keywords = self._extract_keywords(text, analysis_text)

            return {
                "analysis": analysis_text,
                "summary": summary,
                "key_points": key_points,
                "legal_basis": legal_basis,
                "arguments": arguments,
                "keywords": keywords,
                "process_number": process_number,
                "tribunal": tribunal
            }

        except Exception as e:
            logger.error(f"Erro ao analisar jurisprudência: {e}")
            return {
                "analysis": "Análise não disponível no momento.",
                "summary": "Não foi possível gerar resumo.",
                "key_points": [],
                "legal_basis": [],
                "arguments": [],
                "keywords": [],
                "process_number": process_number,
                "tribunal": tribunal
            }

    async def summarize_decision(self, text: str) -> str:
        """Gerar resumo de uma decisão."""
        try:
            prompt = f"""
            Resuma a seguinte decisão judicial de forma clara e objetiva, destacando:
            - O que foi decidido
            - Os principais fundamentos
            - O resultado final
            
            Texto da decisão:
            {text}
            """

            result = await self.ai_service.generate_text(
                prompt=prompt,
                max_length=500,
                temperature=0.5
            )

            # Processar resultado - generate_text retorna {"generated_text": "..."}
            return result.get("generated_text", "Resumo não disponível.") if isinstance(result, dict) else str(result)

        except Exception as e:
            logger.error(f"Erro ao resumir decisão: {e}")
            return "Não foi possível gerar resumo."

    async def compare_jurisprudences(
        self,
        text1: str,
        text2: str,
        title1: Optional[str] = None,
        title2: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comparar duas jurisprudências.

        Args:
            text1: Texto da primeira jurisprudência
            text2: Texto da segunda jurisprudência
            title1: Título da primeira (opcional)
            title2: Título da segunda (opcional)

        Returns:
            Análise comparativa
        """
        try:
            prompt = f"""
            Compare as seguintes duas jurisprudências e forneça uma análise comparativa:

            Jurisprudência 1{' - ' + title1 if title1 else ''}:
            {text1}

            Jurisprudência 2{' - ' + title2 if title2 else ''}:
            {text2}

            Por favor, identifique:
            1. Semelhanças entre as decisões
            2. Diferenças principais
            3. Evolução jurisprudencial (se houver)
            4. Fundamentos comuns
            5. Argumentos divergentes
            6. Conclusões comparativas
            """

            result = await self.ai_service.generate_text(
                prompt=prompt,
                max_length=2000,
                temperature=0.7
            )

            # Processar resultado - generate_text retorna {"generated_text": "..."}
            comparison_text = result.get("generated_text", "") if isinstance(result, dict) else str(result)

            # Extrair informações estruturadas
            similarities = self._extract_similarities(comparison_text)
            differences = self._extract_differences(comparison_text)
            evolution = self._extract_evolution(comparison_text)

            return {
                "comparison": comparison_text,
                "similarities": similarities,
                "differences": differences,
                "evolution": evolution
            }

        except Exception as e:
            logger.error(f"Erro ao comparar jurisprudências: {e}")
            return {
                "comparison": "Comparação não disponível.",
                "similarities": [],
                "differences": [],
                "evolution": ""
            }

    async def generate_strategic_arguments(
        self,
        case_description: str,
        jurisprudence_text: Optional[str] = None
    ) -> List[str]:
        """
        Gerar argumentos estratégicos baseados em jurisprudência.

        Args:
            case_description: Descrição do caso atual
            jurisprudence_text: Texto da jurisprudência de referência (opcional)

        Returns:
            Lista de argumentos estratégicos
        """
        try:
            if jurisprudence_text:
                prompt = f"""
                Com base na seguinte jurisprudência e no caso descrito, gere argumentos estratégicos:

                Jurisprudência de referência:
                {jurisprudence_text}

                Caso atual:
                {case_description}

                Gere argumentos estratégicos que possam ser utilizados no caso atual, baseados na jurisprudência.
                """
            else:
                prompt = f"""
                Gere argumentos estratégicos para o seguinte caso jurídico:

                {case_description}

                Forneça argumentos sólidos e fundamentados.
                """

            result = await self.ai_service.generate_text(
                prompt=prompt,
                max_length=1000,
                temperature=0.8
            )

            # Processar resultado - generate_text retorna {"generated_text": "..."}
            arguments_text = result.get("generated_text", "") if isinstance(result, dict) else str(result)
            return self._extract_arguments_list(arguments_text)

        except Exception as e:
            logger.error(f"Erro ao gerar argumentos estratégicos: {e}")
            return ["Não foi possível gerar argumentos estratégicos no momento."]

    async def chat_with_ai(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Chat com IA sobre jurisprudência.

        Args:
            message: Mensagem do usuário
            context: Contexto adicional (ex: texto de jurisprudência)
            history: Histórico de mensagens anteriores

        Returns:
            Resposta da IA
        """
        try:
            # Construir prompt com contexto e histórico
            prompt_parts = []
            
            if context:
                prompt_parts.append(f"Contexto jurídico:\n{context}\n")
            
            if history:
                prompt_parts.append("Histórico da conversa:\n")
                for msg in history[-5:]:  # Últimas 5 mensagens
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    prompt_parts.append(f"{role}: {content}\n")
            
            prompt_parts.append(f"Usuário: {message}\n")
            prompt_parts.append("Assistente (responda como um assistente jurídico especializado):")
            
            prompt = "".join(prompt_parts)

            result = await self.ai_service.generate_text(
                prompt=prompt,
                max_length=1000,
                temperature=0.7
            )

            # Processar resultado - generate_text retorna {"generated_text": "...", "success": True/False}
            if isinstance(result, dict):
                if result.get("success", True):
                    response = result.get("generated_text", "Desculpe, não consegui processar sua mensagem.")
                else:
                    # Se houve erro, usar mensagem mais amigável
                    error_msg = result.get("error", "")
                    if "410" in error_msg or "Gone" in error_msg:
                        response = "O modelo de IA está temporariamente indisponível. Estamos trabalhando para resolver isso. Por favor, tente novamente em alguns instantes."
                    else:
                        response = result.get("generated_text", "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.")
            else:
                response = str(result) if result else "Desculpe, não consegui processar sua mensagem."

            return {
                "response": response,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Erro no chat com IA: {e}")
            return {
                "response": "Desculpe, ocorreu um erro ao processar sua mensagem.",
                "timestamp": datetime.now().isoformat()
            }

    # Métodos auxiliares para extração
    def _extract_summary(self, analysis_text: str, original_text: str) -> str:
        """Extrair resumo da análise."""
        # Buscar por padrões como "resumo", "conclusão", etc.
        sentences = analysis_text.split(".")
        summary_sentences = []
        
        keywords = ["resumo", "conclusão", "decisão", "resultado", "determina"]
        
        for sentence in sentences[:10]:  # Primeiras 10 frases
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    summary_sentences.append(sentence.strip())
        
        if summary_sentences:
            return ". ".join(summary_sentences[:3])
        
        # Fallback: usar primeiras frases
        return ". ".join(sentences[:3]).strip()

    def _extract_key_points(self, analysis_text: str) -> List[str]:
        """Extrair pontos chave."""
        points = []
        keywords = ["ponto", "aspecto", "questão", "fato", "elemento"]
        
        sentences = analysis_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    points.append(sentence.strip())
        
        return points[:5] if points else ["Análise detalhada recomendada"]

    def _extract_legal_basis(self, analysis_text: str) -> List[str]:
        """Extrair fundamentação legal."""
        basis = []
        keywords = ["lei", "artigo", "código", "constituição", "precedente", "jurisprudência"]
        
        sentences = analysis_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    basis.append(sentence.strip())
        
        return basis[:5] if basis else ["Fundamentação legal não identificada"]

    def _extract_arguments(self, analysis_text: str) -> List[str]:
        """Extrair argumentos estratégicos."""
        arguments = []
        keywords = ["argumento", "defesa", "tese", "fundamento", "razão"]
        
        sentences = analysis_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    arguments.append(sentence.strip())
        
        return arguments[:5] if arguments else ["Argumentos não identificados"]

    def _extract_keywords(self, original_text: str, analysis_text: str) -> List[str]:
        """Extrair palavras-chave."""
        # Palavras jurídicas comuns
        legal_terms = [
            "recurso", "apelação", "agravo", "mandado", "ação", "processo",
            "sentença", "decisão", "julgamento", "tribunal", "vara",
            "direito", "lei", "artigo", "código", "constituição"
        ]
        
        keywords = []
        text_lower = (original_text + " " + analysis_text).lower()
        
        for term in legal_terms:
            if term in text_lower:
                keywords.append(term)
        
        return keywords[:10]

    def _extract_similarities(self, comparison_text: str) -> List[str]:
        """Extrair semelhanças da comparação."""
        similarities = []
        keywords = ["semelhante", "similar", "igual", "comum", "convergente"]
        
        sentences = comparison_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    similarities.append(sentence.strip())
        
        return similarities[:5]

    def _extract_differences(self, comparison_text: str) -> List[str]:
        """Extrair diferenças da comparação."""
        differences = []
        keywords = ["diferente", "divergente", "distinto", "oposto", "contrário"]
        
        sentences = comparison_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    differences.append(sentence.strip())
        
        return differences[:5]

    def _extract_evolution(self, comparison_text: str) -> str:
        """Extrair evolução jurisprudencial."""
        keywords = ["evolução", "mudança", "desenvolvimento", "progressão"]
        
        sentences = comparison_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(sentence.strip()) > 20:
                    return sentence.strip()
        
        return "Evolução jurisprudencial não identificada"

    def _extract_arguments_list(self, arguments_text: str) -> List[str]:
        """Extrair lista de argumentos."""
        arguments = []
        
        # Buscar por padrões numerados ou com marcadores
        lines = arguments_text.split("\n")
        for line in lines:
            line = line.strip()
            # Remover marcadores (1., 2., -, *, etc.)
            if line and (line[0].isdigit() or line[0] in ["-", "*", "•"]):
                line = line.lstrip("0123456789.-*•) ").strip()
                if len(line) > 20:
                    arguments.append(line)
        
        # Se não encontrou padrões, dividir por frases
        if not arguments:
            sentences = arguments_text.split(".")
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) > 20:
                    arguments.append(sentence)
        
        return arguments[:10] if arguments else ["Argumentos não disponíveis"]


# Instância global do serviço
jurisprudence_service = JurisprudenceService()

