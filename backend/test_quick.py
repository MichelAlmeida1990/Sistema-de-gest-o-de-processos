#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Teste rápido das dependências e configurações."""

import sys

print("=" * 60)
print("TESTE RÁPIDO - DEPENDÊNCIAS E CONFIGURAÇÕES")
print("=" * 60)
print()

# Teste 1: Python
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

# Teste 4: Configurações
print("4. Configurações:")
try:
    from app.core.config import settings
    print("   ✅ Config carregado")
    print(f"   Token configurado: {'Sim' if settings.HUGGINGFACE_API_TOKEN else 'Não'}")
    print(f"   Modo: {settings.HUGGINGFACE_MODE}")
    print(f"   Modelo: {settings.HUGGINGFACE_MODEL}")
except Exception as e:
    print(f"   ❌ Erro: {e}")
    import traceback
    traceback.print_exc()
print()

# Teste 5: Serviço de IA
print("5. Serviço de IA:")
try:
    from app.services.ai_service import ai_service
    print("   ✅ Serviço de IA importado")
    print(f"   Token configurado: {'Sim' if ai_service.api_token else 'Não'}")
    print(f"   Modo: {ai_service.mode}")
    print(f"   Modelo: {ai_service.model}")
except Exception as e:
    print(f"   ❌ Erro: {e}")
    import traceback
    traceback.print_exc()
print()

# Teste 6: Calculadora de Prazos
print("6. Calculadora de Prazos:")
try:
    from app.services.deadline_calculator import deadline_calculator
    print("   ✅ Calculadora de prazos importada")
except Exception as e:
    print(f"   ❌ Erro: {e}")
    import traceback
    traceback.print_exc()
print()

print("=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)



