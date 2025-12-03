#!/usr/bin/env python3
"""Testar conexão direta com Hugging Face API."""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_huggingface():
    """Testar API do Hugging Face diretamente."""
    api_token = os.getenv("HUGGINGFACE_API_TOKEN", "")
    
    print("=" * 60)
    print("TESTE DIRETO DA API HUGGING FACE")
    print("=" * 60)
    print(f"Token configurado: {'Sim' if api_token else 'Nao'}")
    if api_token:
        print(f"Token (primeiros 10 chars): {api_token[:10]}...")
    print()
    
    headers = {}
    if api_token:
        headers["Authorization"] = f"Bearer {api_token}"
    
    # Testar primeiro sem token (alguns modelos podem funcionar sem autenticação)
    print("\n[TESTE 1] Tentando sem token primeiro...")
    print("-" * 60)
    
    models_to_test = [
        "gpt2",
        "distilgpt2",
        "EleutherAI/gpt-neo-125M"
    ]
    
    # Testar sem token
    async with httpx.AsyncClient(timeout=60.0) as client_no_token:
        for model in models_to_test:
            url = f"https://router.huggingface.co/models/{model}"
            payload = {
                "inputs": "Hello",
                "parameters": {
                    "max_length": 30,
                    "return_full_text": False
                }
            }
            
            try:
                response = await client_no_token.post(url, json=payload)
                if response.status_code == 200:
                    print(f"[OK] Modelo {model} funciona SEM token!")
                    result = response.json()
                    print(f"Resposta: {result}")
                    break
                elif response.status_code == 503:
                    print(f"[AVISO] {model} carregando (503)")
                else:
                    print(f"[INFO] {model} retornou {response.status_code}")
            except Exception as e:
                print(f"[INFO] {model} erro: {e}")
    
    # Agora testar com token se disponível
    if api_token:
        print("\n[TESTE 2] Tentando COM token...")
        print("-" * 60)
    
    async with httpx.AsyncClient(timeout=60.0, headers=headers) as client:
        for model in models_to_test:
            print(f"\n[TESTE] Modelo: {model}")
            print("-" * 60)
            
            url = f"https://router.huggingface.co/models/{model}"
            payload = {
                "inputs": "Hello, how are you?",
                "parameters": {
                    "max_length": 50,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
            
            try:
                print(f"URL: {url}")
                print(f"Enviando requisição...")
                
                response = await client.post(url, json=payload)
                
                print(f"Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"[OK] SUCESSO!")
                    if isinstance(result, list) and len(result) > 0:
                        generated = result[0].get("generated_text", "")
                        print(f"Texto gerado: {generated[:100]}")
                    elif isinstance(result, dict):
                        generated = result.get("generated_text", "")
                        print(f"Texto gerado: {generated[:100]}")
                    else:
                        print(f"Resposta: {result}")
                    break  # Se um modelo funcionou, parar
                    
                elif response.status_code == 503:
                    print(f"[AVISO] Modelo ainda carregando (503)")
                    print(f"Resposta: {response.text[:200]}")
                    
                elif response.status_code == 401:
                    print(f"[ERRO] Autenticação falhou (401)")
                    print(f"Resposta: {response.text[:200]}")
                    print(f"Verifique se o token está correto!")
                    
                elif response.status_code == 429:
                    print(f"[ERRO] Rate limit atingido (429)")
                    print(f"Resposta: {response.text[:200]}")
                    
                elif response.status_code == 410:
                    print(f"[ERRO] Modelo não disponível (410 Gone)")
                    print(f"Resposta: {response.text[:200]}")
                    
                else:
                    print(f"[ERRO] Status: {response.status_code}")
                    print(f"Resposta: {response.text[:200]}")
                    
            except httpx.TimeoutException:
                print(f"[ERRO] Timeout na requisição")
            except Exception as e:
                print(f"[ERRO] Exceção: {e}")
                import traceback
                traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_huggingface())

