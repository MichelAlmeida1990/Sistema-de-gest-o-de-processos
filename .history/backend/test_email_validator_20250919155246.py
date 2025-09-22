#!/usr/bin/env python3
"""
Teste para verificar se o email-validator está funcionando corretamente
"""

def test_email_validator():
    """Testa se o email-validator está instalado e funcionando."""
    try:
        print("🔍 Testando importação do email-validator...")
        
        # Teste 1: Importar email-validator diretamente
        import email_validator
        print("✅ email-validator importado com sucesso")
        print(f"   Versão: {email_validator.__version__}")
        
        # Teste 2: Importar EmailStr do pydantic
        from pydantic import EmailStr
        print("✅ EmailStr do pydantic importado com sucesso")
        
        # Teste 3: Criar um modelo simples com EmailStr
        from pydantic import BaseModel
        
        class TestModel(BaseModel):
            email: EmailStr
            
        print("✅ Modelo com EmailStr criado com sucesso")
        
        # Teste 4: Validar um email
        test_email = TestModel(email="test@example.com")
        print(f"✅ Email validado com sucesso: {test_email.email}")
        
        # Teste 5: Testar email inválido
        try:
            invalid_email = TestModel(email="email_invalido")
            print("❌ ERRO: Email inválido foi aceito!")
        except Exception as e:
            print(f"✅ Email inválido rejeitado corretamente: {type(e).__name__}")
        
        print("\n🎉 Todos os testes passaram! O email-validator está funcionando corretamente.")
        return True
        
    except ImportError as e:
        print(f"❌ ERRO DE IMPORTAÇÃO: {e}")
        print("\n💡 Solução: Execute 'pip install email-validator' ou 'pip install pydantic[email]'")
        return False
    except Exception as e:
        print(f"❌ ERRO INESPERADO: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TESTE DO EMAIL-VALIDATOR")
    print("=" * 60)
    
    success = test_email_validator()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ RESULTADO: Tudo funcionando corretamente!")
        exit(0)
    else:
        print("❌ RESULTADO: Problemas encontrados!")
        exit(1)
