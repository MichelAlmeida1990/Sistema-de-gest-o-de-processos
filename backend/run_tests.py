#!/usr/bin/env python3
# ===========================================
# SCRIPT PARA EXECUTAR TESTES
# ===========================================

import subprocess
import sys
import os

def run_tests():
    """Executar testes da aplicação."""
    
    print("🧪 Executando testes do Sistema de Gestão de Processos...")
    print("=" * 60)
    
    try:
        # Executar pytest
        result = subprocess.run([
            sys.executable, "-m", "pytest",
            "tests/",
            "-v",
            "--tb=short",
            "--color=yes"
        ], capture_output=True, text=True)
        
        print("📊 Resultado dos Testes:")
        print("-" * 30)
        print(result.stdout)
        
        if result.stderr:
            print("⚠️ Avisos/Erros:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Todos os testes passaram!")
        else:
            print("❌ Alguns testes falharam.")
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Erro ao executar testes: {e}")
        return False

def check_test_coverage():
    """Verificar cobertura de testes."""
    
    print("\n📈 Verificando cobertura de testes...")
    print("-" * 40)
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest",
            "tests/",
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-report=html:htmlcov"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        
        if result.stderr:
            print("⚠️ Avisos:")
            print(result.stderr)
            
        print("\n📁 Relatório HTML gerado em: htmlcov/index.html")
        
    except Exception as e:
        print(f"❌ Erro ao verificar cobertura: {e}")

if __name__ == "__main__":
    success = run_tests()
    
    if success:
        check_test_coverage()
    
    sys.exit(0 if success else 1)
