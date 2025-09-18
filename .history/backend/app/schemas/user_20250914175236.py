# ===========================================
# SCHEMAS DE USUÁRIO
# ===========================================

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from enum import Enum

from app.models.user import UserRole, UserStatus

class UserCreate(BaseModel):
    """Schema para criação de usuário."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=20)
    role: UserRole = UserRole.LAWYER
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter pelo menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')
        if not any(c.islower() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('Senha deve conter pelo menos um número')
        return v

class UserUpdate(BaseModel):
    """Schema para atualização de usuário."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None

class UserLogin(BaseModel):
    """Schema para login de usuário."""
    email: EmailStr
    password: str
    totp_code: Optional[str] = None

class UserProfile(BaseModel):
    """Schema para perfil de usuário."""
    id: int
    email: str
    username: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    status: UserStatus
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    timezone: str
    language: str
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """Schema para resposta de usuário."""
    id: int
    email: str
    username: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    status: UserStatus
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    timezone: str
    language: str
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserChangePassword(BaseModel):
    """Schema para mudança de senha."""
    current_password: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Nova senha deve ter pelo menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('Nova senha deve conter pelo menos uma letra maiúscula')
        if not any(c.islower() for c in v):
            raise ValueError('Nova senha deve conter pelo menos uma letra minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('Nova senha deve conter pelo menos um número')
        return v

class UserList(BaseModel):
    """Schema para lista de usuários."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
