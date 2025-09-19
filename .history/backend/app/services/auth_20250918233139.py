# ===========================================
# SERVIÇO DE AUTENTICAÇÃO
# ===========================================

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
try:
    import pyotp
    PYOTP_AVAILABLE = True
except ImportError:
    PYOTP_AVAILABLE = False
    pyotp = None
try:
    import qrcode
    QRCODE_AVAILABLE = True
except ImportError:
    QRCODE_AVAILABLE = False
    qrcode = None
from io import BytesIO
import base64

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.schemas.auth import Token, TokenData, LoginResponse, TwoFactorSetup

# Contexto de criptografia para senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Serviço de autenticação e autorização."""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verificar se a senha está correta."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Gerar hash da senha."""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Criar token de acesso JWT."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Criar token de refresh JWT."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> TokenData:
        """Verificar e decodificar token JWT."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Tipo de token inválido"
                )
            
            user_id: int = payload.get("sub")
            email: str = payload.get("email")
            
            if user_id is None or email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido"
                )
            
            return TokenData(user_id=user_id, email=email, exp=payload.get("exp"))
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Autenticar usuário com email e senha."""
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    @staticmethod
    def login(db: Session, login_data: UserLogin) -> Dict[str, Any]:
        """Realizar login do usuário."""
        user = AuthService.authenticate_user(db, login_data.email, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verificar 2FA se habilitado
        if user.is_2fa_enabled:
            if not login_data.totp_code:
                raise HTTPException(
                    status_code=status.HTTP_202_ACCEPTED,
                    detail="Código 2FA necessário",
                    headers={"X-Requires-2FA": "true"}
                )
            
            if not AuthService.verify_2fa_code(user.totp_secret, login_data.totp_code):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Código 2FA inválido"
                )
        
        # Criar tokens
        access_token = AuthService.create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        refresh_token = AuthService.create_refresh_token(
            data={"sub": user.id, "email": user.email}
        )
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Criar resposta
        token = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "requires_2fa": user.is_2fa_enabled and not login_data.totp_code
        }
    
    @staticmethod
    def setup_2fa(db: Session, user: User) -> TwoFactorSetup:
        """Configurar 2FA para usuário."""
        if user.is_2fa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA já está habilitado para este usuário"
            )
        
        if not PYOTP_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="2FA não disponível neste ambiente"
            )
        
        # Gerar secret
        secret = pyotp.random_base32()
        
        # Gerar QR code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name=settings.TOTP_ISSUER
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Salvar secret temporariamente
        user.totp_secret = secret
        db.commit()
        
        return TwoFactorSetup(
            secret=secret,
            qr_code=f"data:image/png;base64,{qr_code_base64}",
            backup_codes=[]  # Implementar backup codes se necessário
        )
    
    @staticmethod
    def verify_2fa_code(secret: str, code: str) -> bool:
        """Verificar código 2FA."""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1)
    
    @staticmethod
    def enable_2fa(db: Session, user: User, code: str) -> bool:
        """Habilitar 2FA após verificação do código."""
        if not user.totp_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA não foi configurado"
            )
        
        if not AuthService.verify_2fa_code(user.totp_secret, code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código 2FA inválido"
            )
        
        user.is_2fa_enabled = True
        db.commit()
        
        return True
    
    @staticmethod
    def disable_2fa(db: Session, user: User, code: str) -> bool:
        """Desabilitar 2FA."""
        if not user.is_2fa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA não está habilitado"
            )
        
        if not AuthService.verify_2fa_code(user.totp_secret, code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código 2FA inválido"
            )
        
        user.is_2fa_enabled = False
        user.totp_secret = None
        db.commit()
        
        return True





