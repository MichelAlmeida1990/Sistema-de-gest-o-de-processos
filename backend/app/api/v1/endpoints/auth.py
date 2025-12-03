# ===========================================
# ENDPOINTS DE AUTENTICAÇÃO
# ===========================================

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import traceback

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import LoginResponse, RefreshTokenRequest, TwoFactorVerify
from app.schemas.user import UserCreate, UserLogin, UserProfile
from app.services.auth import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

# ===========================================
# CONFIGURAÇÃO
# ===========================================

router = APIRouter()

# Rate limiter (opcional)
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    # Criar limiter sem tentar ler .env automaticamente
    import os
    os.environ.pop('ENV_FILE', None)  # Remover env_file se existir
    limiter = Limiter(key_func=get_remote_address, default_limits=["1000/hour"])
except (ImportError, Exception) as e:
    limiter = None

# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/login")
async def login(
    request: Request,
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login do usuário - SEM VALIDAÇÃO DE SENHA.
    
    Retorna tokens de acesso e refresh.
    """
    try:
        # Buscar usuário por email (sem validar senha)
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email não encontrado"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        # Criar token sem validar senha
        # O campo 'sub' deve ser string para a biblioteca jose JWT
        access_token = AuthService.create_access_token(data={"sub": str(user.id), "email": user.email})
        refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id), "email": user.email})
        
        from app.schemas.auth import Token
        
        token = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        # Converter usuário ORM para schema Pydantic
        try:
            # Criar dict com todos os campos necessários
            user_dict = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
                "status": user.status.value if hasattr(user.status, 'value') else str(user.status) if user.status else "active",
                "is_active": user.is_active if hasattr(user, 'is_active') else True,
                "is_verified": user.is_verified if hasattr(user, 'is_verified') else False,
                "is_2fa_enabled": user.is_2fa_enabled if hasattr(user, 'is_2fa_enabled') else False,
                "phone": getattr(user, 'phone', None),
                "avatar_url": getattr(user, 'avatar_url', None),
                "bio": getattr(user, 'bio', None),
                "timezone": getattr(user, 'timezone', 'America/Sao_Paulo'),
                "language": getattr(user, 'language', 'pt-BR'),
                "last_login": getattr(user, 'last_login', None),
                "created_at": user.created_at if hasattr(user, 'created_at') and user.created_at else datetime.now(),
                "updated_at": user.updated_at if hasattr(user, 'updated_at') and user.updated_at else datetime.now()
            }
            user_profile = UserProfile(**user_dict)
        except Exception as profile_error:
            logger.error(f"Erro ao converter usuário para profile: {profile_error}")
            logger.error(traceback.format_exc())
            # Fallback: criar profile básico com campos mínimos
            user_profile = UserProfile(
                id=user.id,
                email=user.email,
                username=user.username,
                full_name=user.full_name,
                role=user.role.value if hasattr(user.role, 'value') else str(user.role),
                status=user.status.value if hasattr(user.status, 'value') else str(user.status) if user.status else "active",
                is_active=getattr(user, 'is_active', True),
                is_verified=getattr(user, 'is_verified', False),
                is_2fa_enabled=getattr(user, 'is_2fa_enabled', False),
                phone=None,
                avatar_url=None,
                bio=None,
                timezone='America/Sao_Paulo',
                language='pt-BR',
                last_login=None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        
        return LoginResponse(user=user_profile, token=token, requires_2fa=False)
        
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Erro no login: {e}")
        logger.error(f"Traceback completo: {error_trace}")
        # Em desenvolvimento, mostrar mais detalhes
        if settings.DEBUG:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro interno do servidor: {str(e)}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno do servidor"
            )


@router.post("/register")
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
        # O campo 'sub' deve ser string para a biblioteca jose JWT
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "email": user.email}
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