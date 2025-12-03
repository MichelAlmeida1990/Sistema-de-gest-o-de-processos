#!/usr/bin/env python3
"""Testar endpoint do chat de jurisprudência."""

import requests
import json

def test_chat():
    """Testar endpoint do chat."""
    url = "http://localhost:8000/api/v1/jurisprudence/chat"
    
    # Primeiro, precisamos fazer login para obter o token
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "admin@sistema.com",
        "password": "admin123"
    }
    
    print("1. Fazendo login...")
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"   Status do login: {login_response.status_code}")
        if login_response.status_code == 200:
            login_result = login_response.json()
            # O token pode estar em diferentes lugares na resposta
            token_obj = login_result.get("token") or login_result.get("access_token")
            if isinstance(token_obj, dict):
                token = token_obj.get("access_token")
            else:
                token = token_obj
            
            if not token or not isinstance(token, str):
                print(f"   [ERRO] Token não encontrado ou inválido")
                print(f"   Resposta completa: {login_result}")
                return
            print(f"   [OK] Login realizado. Token obtido (primeiros 20 chars: {token[:20]}...)")
        else:
            print(f"   [ERRO] Login falhou: {login_response.status_code}")
            print(f"   Resposta: {login_response.text}")
            return
    except Exception as e:
        print(f"   [ERRO] Erro no login: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Agora testar o chat
    print("\n2. Testando endpoint do chat...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    chat_data = {
        "message": "Gere um argumento estratégico para um caso jurídico",
        "context": None,
        "history": None
    }
    
    try:
        response = requests.post(url, json=chat_data, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] Resposta recebida!")
            print(f"   Resposta da IA: {result.get('response', 'N/A')[:200]}...")
        else:
            print(f"   [ERRO] Status: {response.status_code}")
            print(f"   Resposta: {response.text}")
    except Exception as e:
        print(f"   [ERRO] Erro na requisição: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_chat()

