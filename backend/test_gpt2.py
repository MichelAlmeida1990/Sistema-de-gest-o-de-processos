#!/usr/bin/env python3
"""Teste rápido do modelo GPT-2 via Hugging Face Inference API."""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_gpt2():
    """Testar modelo GPT-2."""
    api_token = os.getenv("HUGGINGFACE_API_TOKEN", "")
    
    headers = {}
    if api_token:
        headers["Authorization"] = f"Bearer {api_token}"
    
    async with httpx.AsyncClient(timeout=60.0, headers=headers) as client:
        url = "https://api-inference.huggingface.co/models/gpt2"
        payload = {
            "inputs": "Gere um argumento estratégico para um caso jurídico sobre",
            "parameters": {
                "max_length": 100,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        print("[TESTE] Testando modelo GPT-2...")
        print(f"URL: {url}")
        print(f"Payload: {payload}")
        print()
        
        try:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("[OK] SUCESSO!")
                print(f"Resposta: {result}")
                if isinstance(result, list) and len(result) > 0:
                    generated = result[0].get("generated_text", "")
                    print(f"\n[TEXTO GERADO] {generated}")
                elif isinstance(result, dict):
                    generated = result.get("generated_text", "")
                    print(f"\n[TEXTO GERADO] {generated}")
            elif response.status_code == 503:
                print("[AVISO] Modelo ainda carregando (503). Isso e normal na primeira vez.")
                print("Aguarde alguns segundos e tente novamente.")
            else:
                print(f"[ERRO] Status: {response.status_code}")
                print(f"Resposta: {response.text}")
        except Exception as e:
            print(f"[ERRO] EXCECAO: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gpt2())

