#!/usr/bin/env python3
"""Verificar se o token está configurado corretamente."""

import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

token = os.getenv("HUGGINGFACE_API_TOKEN", "")
print("=" * 60)
print("VERIFICAÇÃO DO TOKEN HUGGING FACE")
print("=" * 60)
print(f"Token encontrado: {'Sim' if token else 'Nao'}")
if token:
    print(f"Token (primeiros 15 chars): {token[:15]}...")
    print(f"Token (ultimos 10 chars): ...{token[-10:]}")
    print(f"Token completo: {token}")
    print()
    print("[OK] Token configurado corretamente!")
else:
    print("[ERRO] Token NAO encontrado!")
    print()
    print("Verifique se o arquivo backend/.env contem:")
    print("HUGGINGFACE_API_TOKEN=seu_token_aqui")
print("=" * 60)

