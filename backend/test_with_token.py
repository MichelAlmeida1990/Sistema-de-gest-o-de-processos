#!/usr/bin/env python3
"""Testar API do Hugging Face com token."""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_with_token():
    """Testar com token do .env."""
    # Token do arquivo .env
    token = os.getenv("HUGGINGFACE_API_TOKEN")
    
    if not token:
        print("[ERRO] Token nao encontrado!")
        return
    
    print(f"Token: {token[:10]}...{token[-10:]}")
    print()
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Tentar diferentes formatos de URL
    urls_to_try = [
        "https://api-inference.huggingface.co/models/gpt2",  # URL antiga
        "https://router.huggingface.co/models/gpt2",  # Nova URL
        "https://api-inference.huggingface.co/v1/models/gpt2",  # Com /v1
        "https://router.huggingface.co/v1/models/gpt2",  # Com /v1
    ]
    
    for url in urls_to_try:
        print(f"\nTestando: {url}")
    payload = {
        "inputs": "Hello, how are you?",
        "parameters": {
            "max_length": 50,
            "return_full_text": False
        }
    }
    
    print(f"Testando: {url}")
    print(f"Com token: Sim")
    print()
    
    async with httpx.AsyncClient(timeout=60.0, headers=headers) as client:
        for url in urls_to_try:
            print(f"\nTestando: {url}")
            try:
                response = await client.post(url, json=payload)
                print(f"Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print("[OK] SUCESSO com esta URL!")
                    print(f"Resposta: {result}")
                    break
                elif response.status_code == 503:
                    print("[AVISO] Modelo carregando (503)")
                elif response.status_code == 410:
                    print("[ERRO] URL nao suportada (410)")
                else:
                    print(f"[INFO] Status: {response.status_code}")
                    print(f"Resposta: {response.text[:200]}")
            except Exception as e:
                print(f"[ERRO] Excecao: {e}")

if __name__ == "__main__":
    asyncio.run(test_with_token())

