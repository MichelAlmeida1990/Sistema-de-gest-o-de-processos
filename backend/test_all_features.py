#!/usr/bin/env python3
"""
Script de Teste Completo - Verificação de Todas as Funcionalidades
Testa todos os endpoints e funcionalidades principais do sistema.
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Configurações
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Credenciais de teste
TEST_USER = {
    "email": "admin@sistema.com",
    "password": "123456"
}

# Cores para output (Windows compatible)
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_success(message: str):
    print(f"{Colors.GREEN}[OK]{Colors.RESET} {message}")

def print_error(message: str):
    print(f"{Colors.RED}[ERRO]{Colors.RESET} {message}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}[AVISO]{Colors.RESET} {message}")

def print_info(message: str):
    print(f"{Colors.BLUE}[INFO]{Colors.RESET} {message}")

def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

class TestRunner:
    def __init__(self):
        self.token: Optional[str] = None
        self.results: Dict[str, List[Tuple[str, bool, str]]] = {}
        self.session = requests.Session()
        self.session.timeout = 10

    def test_health_check(self) -> bool:
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

    def test_auth_login(self) -> bool:
        """Testa login e obtém token."""
        print_info("Testando Autenticação (Login)...")
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=TEST_USER
            )
            if response.status_code == 200:
                data = response.json()
                # Debug: verificar estrutura da resposta
                print_info(f"Resposta do login: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                
                # Verificar diferentes formatos de resposta
                if isinstance(data, dict):
                    # A resposta usa "token", não "access_token"
                    token_obj = data.get("token")
                    if isinstance(token_obj, dict):
                        self.token = token_obj.get("access_token") or token_obj.get("token")
                    else:
                        self.token = data.get("access_token") or data.get("token")
                    # Se ainda não encontrou, verificar dentro de "data"
                    if not self.token and isinstance(data.get("data"), dict):
                        self.token = data.get("data", {}).get("access_token")
                else:
                    self.token = None
                
                if self.token:
                    # Garantir que o token é uma string válida e limpa
                    if isinstance(self.token, bytes):
                        self.token = self.token.decode('utf-8', errors='ignore')
                    self.token = str(self.token).strip()
                    
                    # Limpar headers anteriores completamente e criar novo
                    self.session.headers.clear()
                    self.session.headers.update({
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.token}"
                    })
                    print_success(f"Login OK - Token obtido (tamanho: {len(self.token)} chars)")
                    return True
                else:
                    print_error(f"Token não encontrado na resposta. Resposta: {json.dumps(data, indent=2, ensure_ascii=False)}")
                    return False
            else:
                print_error(f"Login falhou: Status {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print_error(f"Login erro: {str(e)}")
            return False

    def test_endpoint(self, name: str, method: str, url: str, 
                     requires_auth: bool = True, 
                     data: Optional[Dict] = None,
                     expected_status: int = 200) -> bool:
        """Testa um endpoint genérico."""
        try:
            if requires_auth and not self.token:
                print_warning(f"{name}: Token não disponível, pulando...")
                return False

            if method.upper() == "GET":
                response = self.session.get(url)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                print_error(f"{name}: Método {method} não suportado")
                return False

            if response.status_code == expected_status:
                print_success(f"{name}: OK (Status {response.status_code})")
                return True
            else:
                print_error(f"{name}: Falhou (Status {response.status_code})")
                if response.text:
                    try:
                        error_data = response.json()
                        print_error(f"  Erro: {error_data}")
                    except:
                        print_error(f"  Resposta: {response.text[:200]}")
                return False
        except requests.exceptions.Timeout:
            print_error(f"{name}: Timeout")
            return False
        except Exception as e:
            print_error(f"{name}: Erro - {str(e)}")
            return False

    def test_dashboard(self) -> bool:
        """Testa endpoints do Dashboard."""
        print_info("Testando Dashboard...")
        results = []
        
        # Stats
        results.append((
            "Dashboard Stats",
            self.test_endpoint("Dashboard Stats", "GET", f"{API_BASE}/dashboard/stats"),
            ""
        ))
        
        # Recent Activity
        results.append((
            "Dashboard Recent Activity",
            self.test_endpoint("Dashboard Recent Activity", "GET", f"{API_BASE}/dashboard/recent-activity"),
            ""
        ))
        
        self.results["Dashboard"] = results
        return all(r[1] for r in results)

    def test_processes(self) -> bool:
        """Testa endpoints de Processos."""
        print_info("Testando Processos...")
        results = []
        
        # Listar processos
        results.append((
            "Listar Processos",
            self.test_endpoint("Listar Processos", "GET", f"{API_BASE}/processes"),
            ""
        ))
        
        # Criar processo de teste
        test_process = {
            "process_number": f"TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "title": "Processo de Teste",
            "client_name": "Cliente Teste",
            "status": "active",
            "tribunal": "TJSP",
            "court": "1ª Vara Cível"
        }
        results.append((
            "Criar Processo",
            self.test_endpoint("Criar Processo", "POST", f"{API_BASE}/processes", data=test_process, expected_status=201),
            ""
        ))
        
        self.results["Processos"] = results
        return all(r[1] for r in results)

    def test_tasks(self) -> bool:
        """Testa endpoints de Tarefas."""
        print_info("Testando Tarefas...")
        results = []
        
        # Listar tarefas
        results.append((
            "Listar Tarefas",
            self.test_endpoint("Listar Tarefas", "GET", f"{API_BASE}/tasks"),
            ""
        ))
        
        self.results["Tarefas"] = results
        return all(r[1] for r in results)

    def test_users(self) -> bool:
        """Testa endpoints de Usuários."""
        print_info("Testando Usuários...")
        results = []
        
        # Listar usuários
        results.append((
            "Listar Usuários",
            self.test_endpoint("Listar Usuários", "GET", f"{API_BASE}/users"),
            ""
        ))
        
        # Perfil do usuário atual
        results.append((
            "Perfil do Usuário",
            self.test_endpoint("Perfil do Usuário", "GET", f"{API_BASE}/users/me"),
            ""
        ))
        
        self.results["Usuários"] = results
        return all(r[1] for r in results)

    def test_jurisprudence(self) -> bool:
        """Testa endpoints de Jurisprudência."""
        print_info("Testando Assistente de Jurisprudência...")
        results = []
        
        # Listar jurisprudências
        results.append((
            "Listar Jurisprudências",
            self.test_endpoint("Listar Jurisprudências", "GET", f"{API_BASE}/jurisprudence/"),
            ""
        ))
        
        # Testar chat (pode demorar)
        print_info("Testando Chat de Jurisprudência (pode demorar)...")
        chat_data = {
            "message": "Olá, como você pode me ajudar?",
            "history": []
        }
        results.append((
            "Chat de Jurisprudência",
            self.test_endpoint("Chat de Jurisprudência", "POST", 
                             f"{API_BASE}/jurisprudence/chat", 
                             data=chat_data,
                             expected_status=200),
            ""
        ))
        
        self.results["Jurisprudência"] = results
        return all(r[1] for r in results)

    def test_legal_diagnosis(self) -> bool:
        """Testa endpoints de Diagnóstico Jurídico."""
        print_info("Testando Diagnóstico Jurídico...")
        results = []
        
        # Listar diagnósticos
        results.append((
            "Listar Diagnósticos",
            self.test_endpoint("Listar Diagnósticos", "GET", f"{API_BASE}/legal-diagnosis/"),
            ""
        ))
        
        self.results["Diagnóstico Jurídico"] = results
        return all(r[1] for r in results)

    def test_financial(self) -> bool:
        """Testa endpoints Financeiros."""
        print_info("Testando Financeiro...")
        results = []
        
        # Listar pagamentos
        results.append((
            "Listar Pagamentos",
            self.test_endpoint("Listar Pagamentos", "GET", f"{API_BASE}/financial/payments"),
            ""
        ))
        
        self.results["Financeiro"] = results
        return all(r[1] for r in results)

    def test_precatorios(self) -> bool:
        """Testa endpoints de Precatórios."""
        print_info("Testando Precatórios...")
        results = []
        
        # Listar precatórios
        results.append((
            "Listar Precatórios",
            self.test_endpoint("Listar Precatórios", "GET", f"{API_BASE}/precatorios/"),
            ""
        ))
        
        self.results["Precatórios"] = results
        return all(r[1] for r in results)

    def test_notifications(self) -> bool:
        """Testa endpoints de Notificações."""
        print_info("Testando Notificações...")
        results = []
        
        # Listar notificações
        results.append((
            "Listar Notificações",
            self.test_endpoint("Listar Notificações", "GET", f"{API_BASE}/notifications/"),
            ""
        ))
        
        self.results["Notificações"] = results
        return all(r[1] for r in results)

    def test_timeline(self) -> bool:
        """Testa endpoints de Timeline."""
        print_info("Testando Timeline...")
        results = []
        
        # Listar timeline
        results.append((
            "Listar Timeline",
            self.test_endpoint("Listar Timeline", "GET", f"{API_BASE}/timeline/"),
            ""
        ))
        
        self.results["Timeline"] = results
        return all(r[1] for r in results)

    def test_reports(self) -> bool:
        """Testa endpoints de Relatórios."""
        print_info("Testando Relatórios...")
        results = []
        
        # Dashboard stats (relatórios)
        results.append((
            "Relatórios Dashboard",
            self.test_endpoint("Relatórios Dashboard", "GET", f"{API_BASE}/reports/dashboard"),
            ""
        ))
        
        self.results["Relatórios"] = results
        return all(r[1] for r in results)

    def test_indices_economicos(self) -> bool:
        """Testa endpoints de Índices Econômicos."""
        print_info("Testando Índices Econômicos...")
        results = []
        
        # Listar índices
        results.append((
            "Listar Índices",
            self.test_endpoint("Listar Índices", "GET", f"{API_BASE}/indices-economicos/"),
            ""
        ))
        
        self.results["Índices Econômicos"] = results
        return all(r[1] for r in results)

    def test_deadlines(self) -> bool:
        """Testa endpoints de Cálculo de Prazos."""
        print_info("Testando Cálculo de Prazos...")
        results = []
        
        # Calcular prazo
        deadline_data = {
            "data_inicial": "2024-01-01",
            "numero_dias": 15,
            "incluir_finais_semana": False
        }
        results.append((
            "Calcular Prazo",
            self.test_endpoint("Calcular Prazo", "POST", 
                             f"{API_BASE}/deadlines/calculate", 
                             data=deadline_data),
            ""
        ))
        
        self.results["Cálculo de Prazos"] = results
        return all(r[1] for r in results)

    def run_all_tests(self):
        """Executa todos os testes."""
        print_header("INICIANDO TESTES COMPLETOS DO SISTEMA")
        print_info(f"URL Base: {BASE_URL}")
        print_info(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        all_passed = True
        
        # Testes básicos (sem autenticação)
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
        all_passed &= self.test_dashboard()
        all_passed &= self.test_processes()
        all_passed &= self.test_tasks()
        all_passed &= self.test_users()
        
        print_header("4. FUNCIONALIDADES JURÍDICAS")
        all_passed &= self.test_jurisprudence()
        all_passed &= self.test_legal_diagnosis()
        all_passed &= self.test_precatorios()
        all_passed &= self.test_deadlines()
        
        print_header("5. FUNCIONALIDADES ADICIONAIS")
        all_passed &= self.test_financial()
        all_passed &= self.test_notifications()
        all_passed &= self.test_timeline()
        all_passed &= self.test_reports()
        all_passed &= self.test_indices_economicos()
        
        # Resumo final
        self.print_summary()
        
        return all_passed

    def print_summary(self):
        """Imprime resumo dos testes."""
        print_header("RESUMO DOS TESTES")
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category, tests in self.results.items():
            print(f"\n{Colors.BOLD}{category}:{Colors.RESET}")
        for name, passed, error in tests:
            total_tests += 1
            if passed:
                passed_tests += 1
                print(f"  {Colors.GREEN}[OK]{Colors.RESET} {name}")
            else:
                failed_tests += 1
                print(f"  {Colors.RED}[ERRO]{Colors.RESET} {name}")
                if error:
                    print(f"    {Colors.RED}{error}{Colors.RESET}")
        
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"Total de Testes: {total_tests}")
        print(f"{Colors.GREEN}Passou: {passed_tests}{Colors.RESET}")
        print(f"{Colors.RED}Falhou: {failed_tests}{Colors.RESET}")
        
        if failed_tests == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}[OK] TODOS OS TESTES PASSARAM!{Colors.RESET}")
        else:
            percentage = (passed_tests / total_tests) * 100
            print(f"\n{Colors.YELLOW}Taxa de Sucesso: {percentage:.1f}%{Colors.RESET}")

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

