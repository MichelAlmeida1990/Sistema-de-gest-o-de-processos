#!/usr/bin/env python3
"""
Script para verificar usuário admin.
"""

from app.core.database import get_db
from app.models.user import User
from passlib.context import CryptContext

def check_admin_user():
    """Verificar usuário admin."""
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = next(get_db())
    
    user = db.query(User).filter(User.email == 'admin@teste.com').first()
    
    if user:
        print(f"✅ Usuário encontrado: {user.email}")
        print(f"Username: {user.username}")
        print(f"Active: {user.is_active}")
        print(f"Role: {user.role}")
        
        # Verificar senha
        password_check = pwd_context.verify("admin123", user.hashed_password)
        print(f"Password check: {password_check}")
        
        if not password_check:
            print("❌ Senha incorreta! Atualizando...")
            user.hashed_password = pwd_context.hash("admin123")
            db.commit()
            print("✅ Senha atualizada!")
    else:
        print("❌ Usuário não encontrado!")

if __name__ == "__main__":
    check_admin_user()
