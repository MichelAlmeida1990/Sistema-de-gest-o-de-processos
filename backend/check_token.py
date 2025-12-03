#!/usr/bin/env python3
"""Verificar e testar token do Hugging Face."""

import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

token = os.getenv("HUGGINGFACE_API_TOKEN", "")
print(f"Token encontrado: {'Sim' if token else 'Nao'}")
if token:
    print(f"Token (primeiros 10): {token[:10]}...")
    print(f"Token (ultimos 10): ...{token[-10:]}")
    print(f"Token completo: {token}")
else:
    print("Token NAO encontrado no .env!")
    print("Verifique se o arquivo backend/.env existe e contem:")
    print("HUGGINGFACE_API_TOKEN=hf_...")



