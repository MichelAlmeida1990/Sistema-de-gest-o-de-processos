#!/usr/bin/env python3
"""Verificar configuração do modelo LLM."""

from app.core.config import settings

print(f"Modelo LLM: {settings.HUGGINGFACE_LLM_MODEL}")
print(f"Token configurado: {'Sim' if settings.HUGGINGFACE_API_TOKEN else 'Nao'}")
print(f"Modo: {settings.HUGGINGFACE_MODE}")
print(f"Timeout: {settings.AI_REQUEST_TIMEOUT}s")



