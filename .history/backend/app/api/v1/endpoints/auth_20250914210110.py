# ===========================================
# ENDPOINTS DE AUTENTICAÇÃO
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import LoginResponse, RefreshTokenRequest, TwoFactorVerify
from app.schemas.user import UserCreate, UserLogin
from app.services.auth import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

# ===========================================
# CONFIGURAÇÃO
# ===========================================

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/login", response_model=LoginResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def login(
    request: Request,
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login do usuário.
    
    Retorna tokens de acesso e refresh.
    """
    try:
        return AuthService.login(db, login_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/test-user")
async def test_user(db: Session = Depends(get_db)):
    """Endpoint de teste para verificar consulta de usuário."""
    try:
        user = db.query(User).filter(User.email == "admin@teste.com").first()
        if user:
            return {
                "found": True,
                "email": user.email,
                "is_active": user.is_active,
                "role": user.role.value if user.role else None
            }
        else:
            return {"found": False}
    except Exception as e:
        return {"error": str(e)}

@router.post("/test-password")
async def test_password(db: Session = Depends(get_db)):
    """Endpoint de teste para verificar senha."""
    try:
        from app.services.auth import AuthService
        user = db.query(User).filter(User.email == "admin@teste.com").first()
        if user:
            password_valid = AuthService.verify_password("123456", user.hashed_password)
            return {
                "password_valid": password_valid,
                "hashed_password": user.hashed_password[:20] + "..."
            }
        else:
            return {"error": "User not found"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/register")
@limiter.limit("10/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar novo usuário.
    """
    try:
        # Verificar se usuário já existe
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
        
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome de usuário já está em uso"
            )
        
        # Criar usuário
        hashed_password = AuthService.get_password_hash(user_data.password)
        
        # Converter role string para enum
        from app.models.user import UserRole
        if user_data.role == "admin":
            role_enum = UserRole.ADMIN
        elif user_data.role == "lawyer":
            role_enum = UserRole.LAWYER
        elif user_data.role == "assistant":
            role_enum = UserRole.ASSISTANT
        else:
            role_enum = UserRole.CLIENT
        
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            phone=user_data.phone,
            hashed_password=hashed_password,
            role=role_enum
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "message": "Usuário criado com sucesso",
            "user_id": user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no registro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/logout")
async def logout():
    """
    Logout do usuário.
    
    Invalida o token de acesso.
    """
    # TODO: Implementar invalidação de token no Redis
    return {"message": "Logout realizado com sucesso"}

@router.post("/refresh")
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Renovar token de acesso.
    
    Usa o refresh token para obter um novo access token.
    """
    try:
        # Verificar refresh token
        token_data = AuthService.verify_token(refresh_data.refresh_token, "refresh")
        
        # Buscar usuário
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        # Criar novo access token
        access_token = AuthService.create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no refresh token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de refresh inválido"
        )

@router.post("/2fa/setup")
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Configurar autenticação de dois fatores.
    
    Gera QR code para configurar 2FA.
    """
    try:
        return AuthService.setup_2fa(db, current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no setup de 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/2fa/enable")
async def enable_2fa(
    verify_data: TwoFactorVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Habilitar 2FA após verificação do código.
    """
    try:
        AuthService.enable_2fa(db, current_user, verify_data.code)
        return {"message": "2FA habilitado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao habilitar 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/2fa/disable")
async def disable_2fa(
    verify_data: TwoFactorVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Desabilitar 2FA.
    """
    try:
        AuthService.disable_2fa(db, current_user, verify_data.code)
        return {"message": "2FA desabilitado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao desabilitar 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me")
async def get_current_user(
    current_user: User = Depends(get_current_user)
):
    """
    Obter dados do usuário atual.
    
    Retorna informações do usuário autenticado.
    """
    return current_user