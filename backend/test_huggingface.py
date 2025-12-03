# ===========================================
# SCRIPT DE TESTE - HUGGING FACE
# ===========================================
"""
Script para testar a configuração do Hugging Face.

Uso:
    python test_huggingface.py
"""

import asyncio
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.ai_service import ai_service
from app.core.config import settings


async def test_huggingface():
    """Testar integração com Hugging Face."""
    
    print("=" * 60)
    print("TESTE DE CONFIGURAÇÃO - HUGGING FACE")
    print("=" * 60)
    print()
    
    # Verificar configurações
    print("📋 Configurações:")
    print(f"   Modo: {settings.HUGGINGFACE_MODE}")
    print(f"   Modelo: {settings.HUGGINGFACE_MODEL}")
    print(f"   Modelo LLM: {settings.HUGGINGFACE_LLM_MODEL}")
    print(f"   Token configurado: {'Sim' if settings.HUGGINGFACE_API_TOKEN else 'Não'}")
    print()
    
    if not settings.HUGGINGFACE_API_TOKEN:
        print("⚠️  AVISO: Token não configurado!")
        print("   A API ainda funcionará, mas com limites menores.")
        print("   Para obter um token gratuito:")
        print("   1. Acesse: https://huggingface.co/settings/tokens")
        print("   2. Crie um token com permissão 'Read'")
        print("   3. Adicione no arquivo .env: HUGGINGFACE_API_TOKEN=seu_token")
        print()
    
    # Teste 1: Análise de sentimento
    print("🧪 Teste 1: Análise de Sentimento")
    print("-" * 60)
    try:
        result = await ai_service.analyze_text(
            text="Este é um texto de teste para análise de sentimento.",
            task="sentiment-analysis"
        )
        print("✅ Sucesso!")
        print(f"   Resultado: {result.get('result', 'N/A')}")
        print()
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print()
    
    # Teste 2: Resumo de texto
    print("🧪 Teste 2: Resumo de Texto")
    print("-" * 60)
    try:
        text = """
        O direito processual civil é o ramo do direito que trata dos procedimentos
        e normas que regulam a tramitação dos processos judiciais. Ele estabelece
        as regras para a apresentação de petições, o andamento dos processos,
        os prazos processuais e os recursos cabíveis. É fundamental para garantir
        o acesso à justiça e a efetividade do processo judicial.
        """
        result = await ai_service.summarize_text(
            text=text.strip(),
            max_length=50,
            min_length=20
        )
        print("✅ Sucesso!")
        print(f"   Resumo: {result.get('summary', 'N/A')}")
        print()
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print()
    
    # Teste 3: Geração de texto
    print("🧪 Teste 3: Geração de Texto")
    print("-" * 60)
    try:
        result = await ai_service.generate_text(
            prompt="O que é um prazo processual?",
            max_length=100,
            temperature=0.7
        )
        print("✅ Sucesso!")
        print(f"   Texto gerado: {result.get('generated_text', 'N/A')[:100]}...")
        print()
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print()
    
    # Teste 4: Chat
    print("🧪 Teste 4: Chat com IA")
    print("-" * 60)
    try:
        result = await ai_service.chat_completion(
            messages=[
                {"role": "user", "content": "O que é um processo judicial?"}
            ],
            system_prompt="Você é um assistente jurídico especializado em direito processual."
        )
        print("✅ Sucesso!")
        print(f"   Resposta: {result.get('response', 'N/A')[:150]}...")
        print()
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print()
    
    # Fechar conexão
    await ai_service.close()
    
    print("=" * 60)
    print("TESTE CONCLUÍDO")
    print("=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(test_huggingface())
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário.")
    except Exception as e:
        print(f"\n\n❌ Erro fatal: {str(e)}")
        import traceback
        traceback.print_exc()



