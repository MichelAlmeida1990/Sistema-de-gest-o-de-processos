#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Teste Completo - Verificação de Todas as Funcionalidades
Testa todos os endpoints e funcionalidades principais do sistema.
"""

import requests
import json
import sys
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Credenciais de teste
TEST_USER = {
    "email": "admin@sistema.com",
    "password": "123456"
}

def print_success(message):
    print(f"[OK] {message}")

def print_error(message):
    print(f"[ERRO] {message}")

def print_warning(message):
    print(f"[AVISO] {message}")

def print_info(message):
    print(f"[INFO] {message}")

def print_header(message):
    print(f"\n{'='*60}")
    print(f"{message}")
    print(f"{'='*60}\n")

class TestRunner:
    def __init__(self):
        self.token = None
        self.results = {}
        self.session = requests.Session()
        self.session.timeout = 10

    def test_health_check(self):
        """Testa o endpoint de health check."""
        print_info("Testando Health Check...")
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                print_success(f"Health Check OK - Database: {data.get('database')}, Redis: {data.get('redis')}")
                return True
            else:
                print_error(f"Health Check falhou: Status {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Health Check erro: {str(e)}")
            return False

    def test_auth_login(self):
        """Testa login e obtém token."""
        print_info("Testando Autenticação (Login)...")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=TEST_USER
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                if self.token:
                    self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                    print_success("Login OK - Token obtido")
                    return True
                else:
                    print_error("Token não encontrado na resposta")
                    return False
            else:
                print_error(f"Login falhou: Status {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Login erro: {str(e)}")
            return False

    def test_endpoint(self, name, method, url, requires_auth=True, data=None, expected_status=200):
        """Testa um endpoint genérico."""
        try:
            if requires_auth and not self.token:
                print_warning(f"{name}: Token não disponível, pulando...")
                return False

            if method.upper() == "GET":
                response = self.session.get(url)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            else:
                print_error(f"{name}: Método {method} não suportado")
                return False

            if response.status_code == expected_status:
                print_success(f"{name}: OK (Status {response.status_code})")
                return True
            else:
                print_error(f"{name}: Falhou (Status {response.status_code})")
                return False
        except requests.exceptions.Timeout:
            print_error(f"{name}: Timeout")
            return False
        except Exception as e:
            print_error(f"{name}: Erro - {str(e)}")
            return False

    def run_all_tests(self):
        """Executa todos os testes."""
        print_header("INICIANDO TESTES COMPLETOS DO SISTEMA")
        print_info(f"URL Base: {BASE_URL}")
        print_info(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        all_passed = True
        
        # Testes básicos
        print_header("1. TESTES BÁSICOS")
        if not self.test_health_check():
            print_error("Health check falhou! Verifique se o servidor está rodando.")
            return False
        
        # Autenticação
        print_header("2. AUTENTICAÇÃO")
        if not self.test_auth_login():
            print_error("Login falhou! Verifique as credenciais.")
            return False
        
        # Testes de funcionalidades
        print_header("3. FUNCIONALIDADES PRINCIPAIS")
        all_passed &= self.test_endpoint("Dashboard Stats", "GET", f"{API_BASE}/dashboard/stats")
        all_passed &= self.test_endpoint("Dashboard Recent Activity", "GET", f"{API_BASE}/dashboard/recent-activity")
        all_passed &= self.test_endpoint("Listar Processos", "GET", f"{API_BASE}/processes")
        all_passed &= self.test_endpoint("Listar Tarefas", "GET", f"{API_BASE}/tasks")
        all_passed &= self.test_endpoint("Listar Usuários", "GET", f"{API_BASE}/users")
        all_passed &= self.test_endpoint("Perfil do Usuário", "GET", f"{API_BASE}/users/me")
        
        print_header("4. FUNCIONALIDADES JURÍDICAS")
        all_passed &= self.test_endpoint("Listar Jurisprudências", "GET", f"{API_BASE}/jurisprudence/")
        all_passed &= self.test_endpoint("Listar Diagnósticos", "GET", f"{API_BASE}/legal-diagnosis/")
        all_passed &= self.test_endpoint("Listar Precatórios", "GET", f"{API_BASE}/precatorios/")
        
        print_header("5. FUNCIONALIDADES ADICIONAIS")
        all_passed &= self.test_endpoint("Listar Notificações", "GET", f"{API_BASE}/notifications/")
        all_passed &= self.test_endpoint("Listar Timeline", "GET", f"{API_BASE}/timeline/")
        all_passed &= self.test_endpoint("Relatórios Dashboard", "GET", f"{API_BASE}/reports/dashboard")
        
        print_header("RESUMO")
        if all_passed:
            print_success("TODOS OS TESTES PASSARAM!")
        else:
            print_warning("Alguns testes falharam. Verifique os erros acima.")
        
        return all_passed

def main():
    """Função principal."""
    runner = TestRunner()
    
    try:
        success = runner.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTestes interrompidos pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro fatal: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

