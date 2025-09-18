#!/usr/bin/env python3
# ===========================================
# GERADOR DE CHAVES SEGURAS PARA PRODUÇÃO
# ===========================================

import secrets
import string
import base64
import os

def generate_secret_key(length=64):
    """Gerar chave secreta segura para JWT."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_encryption_key():
    """Gerar chave de criptografia de 32 bytes."""
    return base64.urlsafe_b64encode(os.urandom(32)).decode('utf-8')

def generate_database_password(length=24):
    """Gerar senha segura para banco de dados."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    print("🔐 Gerador de Chaves Seguras para Produção")
    print("=" * 50)
    
    # Gerar chaves
    secret_key = generate_secret_key()
    encryption_key = generate_encryption_key()
    db_password = generate_database_password()
    
    print("\n📋 Chaves Geradas:")
    print("-" * 30)
    print(f"SECRET_KEY={secret_key}")
    print(f"ENCRYPTION_KEY={encryption_key}")
    print(f"POSTGRES_PASSWORD={db_password}")
    
    print("\n⚠️  IMPORTANTE:")
    print("- Guarde essas chaves em local seguro")
    print("- Use no arquivo .env de produção")
    print("- NUNCA compartilhe essas chaves")
    print("- Configure no Railway/Heroku/Vercel")
    
    # Salvar em arquivo
    with open('.env.production.keys', 'w') as f:
        f.write("# Chaves geradas automaticamente para produção\n")
        f.write("# NÃO COMMITAR ESTE ARQUIVO!\n\n")
        f.write(f"SECRET_KEY={secret_key}\n")
        f.write(f"ENCRYPTION_KEY={encryption_key}\n")
        f.write(f"POSTGRES_PASSWORD={db_password}\n")
    
    print(f"\n💾 Chaves salvas em: .env.production.keys")
    print("🔒 Adicione este arquivo ao .gitignore!")

if __name__ == "__main__":
    main()
