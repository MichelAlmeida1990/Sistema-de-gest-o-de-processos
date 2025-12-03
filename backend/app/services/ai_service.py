# ===========================================
# SERVIÇO DE IA COM HUGGING FACE
# ===========================================

import logging
from typing import Optional, Dict, Any, List
import httpx
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)

# Tentar importar huggingface_hub se disponível
try:
    from huggingface_hub import InferenceClient
    HF_HUB_AVAILABLE = True
except ImportError:
    HF_HUB_AVAILABLE = False
    InferenceClient = None


class AIService:
    """Serviço de IA usando Hugging Face (gratuito)."""

    # A API do Hugging Face mudou - usar a URL correta
    # Para Inference API gratuita, ainda usar api-inference.huggingface.co
    # mas pode precisar de configuração diferente
    BASE_URL = "https://api-inference.huggingface.co/models"
    INFERENCE_API_URL = "https://api-inference.huggingface.co/models"

    def __init__(self):
        self.api_token = settings.HUGGINGFACE_API_TOKEN
        self.mode = settings.HUGGINGFACE_MODE
        self.model = settings.HUGGINGFACE_MODEL
        self.llm_model = settings.HUGGINGFACE_LLM_MODEL
        self.timeout = settings.AI_REQUEST_TIMEOUT
        self.cache_enabled = settings.AI_CACHE_ENABLED

        # Tentar usar huggingface_hub se disponível (forma recomendada)
        if HF_HUB_AVAILABLE and self.api_token:
            try:
                self.hf_client = InferenceClient(token=self.api_token)
                logger.info("Usando huggingface_hub para Inference API")
            except Exception as e:
                logger.warning(f"Erro ao inicializar huggingface_hub: {e}")
                self.hf_client = None
        else:
            self.hf_client = None
            if not HF_HUB_AVAILABLE:
                logger.warning("huggingface_hub não disponível, usando httpx")

        # Cliente HTTP (fallback)
        headers = {}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"

        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            headers=headers
        )

    async def analyze_text(
        self,
        text: str,
        task: str = "sentiment-analysis"
    ) -> Dict[str, Any]:
        """
        Analisar texto usando modelos do Hugging Face.

        Args:
            text: Texto a ser analisado
            task: Tipo de análise (sentiment-analysis, text-classification, etc.)

        Returns:
            Resultado da análise
        """
        try:
            if self.mode == "api":
                return await self._analyze_with_api(text, task)
            else:
                return await self._analyze_local(text, task)
        except Exception as e:
            logger.error(f"Erro ao analisar texto: {e}")
            raise

    async def _analyze_with_api(
        self,
        text: str,
        task: str
    ) -> Dict[str, Any]:
        """Analisar usando Inference API do Hugging Face."""
        try:
            # Escolher modelo baseado na tarefa
            model = self._get_model_for_task(task)

            url = f"{self.INFERENCE_API_URL}/{model}"
            payload = {"inputs": text}

            response = await self.client.post(url, json=payload)

            if response.status_code == 503:
                # Modelo ainda carregando, aguardar
                logger.warning("Modelo ainda carregando, aguardando...")
                import asyncio
                await asyncio.sleep(5)
                response = await self.client.post(url, json=payload)

            response.raise_for_status()
            result = response.json()

            return {
                "success": True,
                "task": task,
                "model": model,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao analisar texto: {e}")
            raise Exception(f"Erro na API do Hugging Face: {e.response.text}")
        except Exception as e:
            logger.error(f"Erro ao analisar texto: {e}")
            raise

    async def _analyze_local(
        self,
        text: str,
        task: str
    ) -> Dict[str, Any]:
        """Analisar usando modelo local (futuro - requer instalação de transformers)."""
        # Por enquanto, usar API mesmo se mode=local
        # Para usar local, seria necessário carregar o modelo com transformers
        logger.warning("Modo local não implementado ainda, usando API")
        return await self._analyze_with_api(text, task)

    def _get_model_for_task(self, task: str) -> str:
        """Obter modelo apropriado para a tarefa."""
        model_map = {
            "sentiment-analysis": "distilbert-base-uncased-finetuned-sst-2-english",
            "text-classification": "distilbert-base-uncased",
            "summarization": "facebook/bart-large-cnn",
            "question-answering": "distilbert-base-cased-distilled-squad",
            "text-generation": self.llm_model,
            "translation": "Helsinki-NLP/opus-mt-pt-en",
        }
        return model_map.get(task, self.model)

    async def generate_text(
        self,
        prompt: str,
        max_length: int = 200,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Gerar texto usando modelo de linguagem.

        Args:
            prompt: Texto inicial/prompt
            max_length: Tamanho máximo do texto gerado
            temperature: Temperatura para geração (0.0-1.0)

        Returns:
            Texto gerado
        """
        # Tentar usar huggingface_hub primeiro (forma recomendada)
        if self.hf_client:
            try:
                import asyncio
                # huggingface_hub é síncrono, então executar em thread
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.hf_client.text_generation(
                        prompt,
                        model=self.llm_model,
                        max_new_tokens=max_length,
                        temperature=temperature
                    )
                )
                return {
                    "success": True,
                    "prompt": prompt,
                    "generated_text": result,
                    "model": self.llm_model,
                    "timestamp": datetime.utcnow().isoformat()
                }
            except Exception as e:
                logger.warning(f"Erro ao usar huggingface_hub, tentando httpx: {e}")
        
        # Fallback para httpx (método antigo)
        try:
            # Tentar múltiplos modelos como fallback (do mais simples ao mais complexo)
            # gpt2 é o modelo mais confiável e sempre disponível na Inference API
            models_to_try = [
                "gpt2",  # Modelo mais confiável e sempre disponível
                "distilgpt2",  # Versão menor e mais rápida do GPT-2
                self.llm_model,  # Modelo configurado pelo usuário
                "EleutherAI/gpt-neo-125M",  # Modelo pequeno e rápido
                "microsoft/DialoGPT-small"  # Para conversas (versão pequena)
            ]
            
            last_error = None
            result = None
            model_used = None
            
            for model in models_to_try:
                try:
                    url = f"{self.INFERENCE_API_URL}/{model}"
                    payload = {
                        "inputs": prompt,
                        "parameters": {
                            "max_length": max_length,
                            "temperature": temperature,
                            "return_full_text": False
                        }
                    }

                    logger.info(f"Tentando modelo: {model}")
                    response = await self.client.post(url, json=payload)

                    if response.status_code == 503:
                        logger.warning(f"Modelo {model} ainda carregando (503), tentando próximo...")
                        last_error = f"Modelo {model} ainda carregando"
                        continue

                    if response.status_code == 410:
                        logger.warning(f"Modelo {model} não está mais disponível (410 Gone), tentando próximo...")
                        last_error = f"Modelo {model} não disponível (410)"
                        continue

                    if response.status_code == 429:
                        logger.warning(f"Rate limit atingido para {model}, tentando próximo...")
                        last_error = f"Rate limit para {model}"
                        continue

                    response.raise_for_status()
                    result = response.json()
                    model_used = model
                    logger.info(f"✅ Modelo {model} funcionou!")
                    break
                except httpx.HTTPStatusError as e:
                    error_msg = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
                    logger.warning(f"Erro HTTP com modelo {model}: {error_msg}")
                    if e.response.status_code in [410, 404]:
                        last_error = error_msg
                        continue
                    # Para outros erros HTTP, tentar próximo modelo
                    last_error = error_msg
                    continue
                except Exception as e:
                    logger.warning(f"Erro inesperado com modelo {model}: {e}")
                    last_error = str(e)
                    continue
            
            # Se nenhum modelo funcionou
            if result is None:
                error_msg = f"Nenhum modelo disponível. Último erro: {last_error}"
                logger.error(error_msg)
                raise Exception(error_msg)

            # Extrair texto gerado
            generated_text = ""
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                generated_text = result.get("generated_text", "")
            
            # Se não conseguiu extrair texto, usar uma mensagem padrão
            if not generated_text or len(generated_text.strip()) == 0:
                logger.warning(f"Modelo {model_used} retornou resposta vazia")
                generated_text = "Não foi possível gerar uma resposta adequada. Por favor, reformule sua pergunta."

            return {
                "success": True,
                "prompt": prompt,
                "generated_text": generated_text,
                "model": model_used,  # Usar o modelo que funcionou
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            logger.error(f"Erro ao gerar texto: {e}")
            logger.error(f"Traceback completo: {error_traceback}")
            
            # Retornar resposta com mais detalhes do erro (em modo debug)
            error_message = "Desculpe, não foi possível gerar uma resposta no momento."
            if settings.DEBUG:
                error_message += f" Erro: {str(e)[:100]}"
            
            return {
                "success": False,
                "prompt": prompt,
                "generated_text": error_message,
                "model": self.llm_model,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)[:200]  # Limitar tamanho do erro
            }

    async def summarize_text(
        self,
        text: str,
        max_length: int = 100,
        min_length: int = 30
    ) -> Dict[str, Any]:
        """
        Resumir texto.

        Args:
            text: Texto a ser resumido
            max_length: Tamanho máximo do resumo
            min_length: Tamanho mínimo do resumo

        Returns:
            Resumo do texto
        """
        try:
            model = "facebook/bart-large-cnn"
            url = f"{self.INFERENCE_API_URL}/{model}"
            payload = {
                "inputs": text,
                "parameters": {
                    "max_length": max_length,
                    "min_length": min_length
                }
            }

            response = await self.client.post(url, json=payload)

            if response.status_code == 503:
                logger.warning("Modelo ainda carregando, aguardando...")
                import asyncio
                await asyncio.sleep(5)
                response = await self.client.post(url, json=payload)

            response.raise_for_status()
            result = response.json()

            summary = ""
            if isinstance(result, list) and len(result) > 0:
                summary = result[0].get("summary_text", "")
            elif isinstance(result, dict):
                summary = result.get("summary_text", "")

            return {
                "success": True,
                "original_text": text[:200] + "..." if len(text) > 200 else text,
                "summary": summary,
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Erro ao resumir texto: {e}")
            raise

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Completar conversa/chat usando modelo de linguagem.

        Args:
            messages: Lista de mensagens no formato [{"role": "user", "content": "..."}]
            system_prompt: Prompt do sistema (opcional)

        Returns:
            Resposta do modelo
        """
        try:
            # Construir prompt a partir das mensagens
            prompt_parts = []
            if system_prompt:
                prompt_parts.append(f"Sistema: {system_prompt}")

            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt_parts.append(f"{role.capitalize()}: {content}")

            prompt = "\n".join(prompt_parts) + "\nAssistente:"

            # Gerar resposta
            result = await self.generate_text(
                prompt=prompt,
                max_length=300,
                temperature=0.7
            )

            return {
                "success": True,
                "messages": messages,
                "response": result.get("generated_text", ""),
                "model": self.llm_model,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Erro ao completar chat: {e}")
            raise

    async def close(self):
        """Fechar cliente HTTP."""
        await self.client.aclose()


# Instância global do serviço
ai_service = AIService()

