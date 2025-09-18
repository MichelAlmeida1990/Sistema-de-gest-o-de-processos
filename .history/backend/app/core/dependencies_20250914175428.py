# ===========================================
# DEPENDÊNCIAS DO FASTAPI
# ===========================================

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth import AuthService
from app.models.user import User, UserRole

# ===========================================
# CONFIGURAÇÃO DE AUTENTICAÇÃO
# ===========================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ===========================================
# DEPENDÊNCIAS
# ===========================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Obter usuário atual a partir do token JWT.
    """
    try:
        # Verificar token
        token_data = AuthService.verify_token(token, "access")
        
        # Buscar usuário
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Obter usuário ativo atual.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Obter usuário administrador atual.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores."
        )
    return current_user

async def get_current_lawyer_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Obter usuário advogado atual.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.LAWYER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas advogados ou administradores."
        )
    return current_user

# ===========================================
# DEPENDÊNCIAS OPCIONAIS
# ===========================================

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Obter usuário atual opcionalmente.
    """
    if not token:
        return None
    
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None
