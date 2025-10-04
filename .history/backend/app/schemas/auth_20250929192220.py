# ===========================================
# SCHEMAS DE AUTENTICAÇÃO
# ===========================================

from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from app.schemas.user import UserProfile

class Token(BaseModel):
    """Schema para token de acesso."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    """Schema para dados do token."""
    user_id: Optional[int] = None
    email: Optional[str] = None
    exp: Optional[datetime] = None

class LoginResponse(BaseModel):
    """Schema para resposta de login."""
    user: UserProfile
    token: Token
    requires_2fa: bool = False

class RefreshTokenRequest(BaseModel):
    """Schema para refresh token."""
    refresh_token: str

class TwoFactorSetup(BaseModel):
    """Schema para configuração de 2FA."""
    secret: str
    qr_code: str
    backup_codes: list[str]

class TwoFactorVerify(BaseModel):
    """Schema para verificação de 2FA."""
    code: str












