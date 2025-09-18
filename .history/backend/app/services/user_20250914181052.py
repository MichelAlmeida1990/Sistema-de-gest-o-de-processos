# ===========================================
# SERVIÇO DE USUÁRIO
# ===========================================

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class UserService:
    """Serviço para gerenciar usuários."""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Criar novo usuário."""
        from app.services.auth import AuthService
        
        hashed_password = AuthService.get_password_hash(user_data.password)
        
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            phone=user_data.phone,
            role=user_data.role,
            hashed_password=hashed_password
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Obter usuário por ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Obter usuário por email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Obter usuário por username."""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Obter lista de usuários."""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def search_users(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Buscar usuários por nome ou email."""
        search_filter = or_(
            User.full_name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%"),
            User.username.ilike(f"%{query}%")
        )
        
        return db.query(User).filter(search_filter).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Atualizar usuário."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Deletar usuário."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        
        return True
    
    @staticmethod
    def change_password(db: Session, user_id: int, new_password: str) -> bool:
        """Alterar senha do usuário."""
        from app.services.auth import AuthService
        
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False
        
        user.hashed_password = AuthService.get_password_hash(new_password)
        user.password_changed_at = datetime.utcnow()
        
        db.commit()
        
        return True
