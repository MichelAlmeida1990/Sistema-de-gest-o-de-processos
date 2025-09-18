#!/usr/bin/env python3
"""
Script para criar usuário admin com senha simples.
"""

from app.core.database import get_db
from app.models.user import User, UserRole
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Configurar contexto de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Criar usuário admin com senha simples."""
    db = next(get_db())
    
    # Verificar se já existe
    existing_user = db.query(User).filter(User.email == 'admin@teste.com').first()
    if existing_user:
        print("Usuário admin já existe. Atualizando senha...")
        # Atualizar senha
        existing_user.hashed_password = pwd_context.hash("admin123")
        existing_user.is_active = True
        existing_user.is_verified = True
        existing_user.role = UserRole.ADMIN
        db.commit()
        print("✅ Senha do usuário admin atualizada!")
    else:
        print("Criando novo usuário admin...")
        # Criar novo usuário
        admin_user = User(
            email='admin@teste.com',
            username='admin',
            full_name='Administrador',
            hashed_password=pwd_context.hash("admin123"),
            is_active=True,
            is_verified=True,
            role=UserRole.ADMIN,
            status='ACTIVE'
        )
        db.add(admin_user)
        db.commit()
        print("✅ Usuário admin criado com sucesso!")
    
    # Verificar se o login funciona
    user = db.query(User).filter(User.email == 'admin@teste.com').first()
    if user and pwd_context.verify("admin123", user.hashed_password):
        print("✅ Verificação de senha bem-sucedida!")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Role: {user.role}")
    else:
        print("❌ Erro na verificação de senha!")

if __name__ == "__main__":
    create_admin_user()
