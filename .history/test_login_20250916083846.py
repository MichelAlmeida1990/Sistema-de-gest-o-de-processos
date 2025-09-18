#!/usr/bin/env python3
"""
Script para testar login e criar usuário admin.
"""

from app.core.database import get_db
from app.models.user import User
from app.services.user import UserService
from app.schemas.user import UserCreate
from app.services.auth import AuthService
from app.schemas.user import UserLogin

def test_login():
    """Testar login com diferentes credenciais."""
    db = next(get_db())
    
    # Verificar usuário existente
    user = db.query(User).filter(User.email == 'admin@teste.com').first()
    if user:
        print(f"Usuário encontrado: {user.email}")
        print(f"Username: {user.username}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print(f"Password hash: {user.hashed_password[:50]}...")
    else:
        print("Usuário não encontrado!")
        return
    
    # Testar login com diferentes senhas
    test_passwords = ['Admin123!', 'admin123', 'admin', 'Admin123']
    
    for password in test_passwords:
        try:
            login_data = UserLogin(email='admin@teste.com', password=password)
            result = AuthService.login(db, login_data)
            print(f"✅ Login bem-sucedido com senha: {password}")
            print(f"Token: {result.access_token[:50]}...")
            return
        except Exception as e:
            print(f"❌ Falha com senha '{password}': {e}")

if __name__ == "__main__":
    test_login()
