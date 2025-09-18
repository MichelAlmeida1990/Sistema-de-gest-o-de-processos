#!/usr/bin/env python3
"""
Script para testar autenticação.
"""

from app.core.database import get_db
from app.services.auth import AuthService
from app.schemas.user import UserLogin

def test_auth():
    """Testar autenticação."""
    db = next(get_db())
    
    # Testar autenticação
    login_data = UserLogin(email='admin@teste.com', password='admin123')
    
    try:
        result = AuthService.login(db, login_data)
        print("✅ Login bem-sucedido!")
        print(f"Token: {result.access_token[:50]}...")
        print(f"User: {result.user.email}")
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        
        # Testar autenticação manual
        user = AuthService.authenticate_user(db, 'admin@teste.com', 'admin123')
        if user:
            print(f"✅ Usuário autenticado: {user.email}")
        else:
            print("❌ Falha na autenticação manual")

if __name__ == "__main__":
    test_auth()
