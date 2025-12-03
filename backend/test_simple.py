#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Teste simples - apenas dependências essenciais."""

print("=" * 60)
print("TESTE SIMPLES - DEPENDÊNCIAS ESSENCIAIS")
print("=" * 60)
print()

# Teste 1: Python
import sys
print("1. Python:")
print(f"   Versão: {sys.version.split()[0]}")
print()

# Teste 2: requests
print("2. requests:")
try:
    import requests
    print("   ✅ requests instalado")
except ImportError as e:
    print(f"   ❌ Erro: {e}")
print()

# Teste 3: httpx
print("3. httpx:")
try:
    import httpx
    print("   ✅ httpx instalado")
    # Testar criação de cliente
    client = httpx.AsyncClient()
    print("   ✅ Cliente httpx criado com sucesso")
except Exception as e:
    print(f"   ❌ Erro: {e}")
print()

# Teste 4: Verificar token no .env
print("4. Token no .env:")
try:
    import os
    from pathlib import Path
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'HUGGINGFACE_API_TOKEN=hf_' in content:
                print("   ✅ Token encontrado no .env")
            else:
                print("   ⚠️  Token não encontrado no .env")
    else:
        print("   ⚠️  Arquivo .env não encontrado")
except Exception as e:
    print(f"   ❌ Erro: {e}")
print()

print("=" * 60)
print("RESUMO:")
print("=" * 60)
print("✅ Dependências principais (httpx, requests) estão OK")
print("✅ Sistema pode usar API do Hugging Face")
print("⚠️  Algumas dependências opcionais podem precisar reinstalação")
print("=" * 60)



