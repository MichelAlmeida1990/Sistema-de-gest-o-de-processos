#!/usr/bin/env python3
"""Testar usando huggingface_hub."""

import os
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("HUGGINGFACE_API_TOKEN")
if not token:
    print("[ERRO] Token não encontrado! Configure HUGGINGFACE_API_TOKEN no .env")
    exit(1)

try:
    from huggingface_hub import InferenceClient
    
    print("Testando com huggingface_hub...")
    print(f"Token: {token[:10]}...{token[-10:]}")
    print()
    
    client = InferenceClient(token=token)
    
    # Testar geração de texto
    print("Testando geração de texto com gpt2...")
    try:
        result = client.text_generation(
            "Hello, how are you?",
            model="gpt2",
            max_new_tokens=50
        )
        print("[OK] SUCESSO!")
        print(f"Resposta: {result}")
    except Exception as e:
        print(f"[ERRO] Erro na geração: {e}")
        import traceback
        traceback.print_exc()
        
except ImportError:
    print("[ERRO] huggingface_hub nao instalado!")
    print("Instale com: pip install huggingface_hub")
except Exception as e:
    print(f"[ERRO] Excecao: {e}")
    import traceback
    traceback.print_exc()



