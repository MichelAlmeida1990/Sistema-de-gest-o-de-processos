# ===========================================
# ENDPOINTS DE USUÁRIOS
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserList
from app.services.user import UserService

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Criar novo usuário (apenas admin)."""
    try:
        # Verificar se email já existe
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Verificar se username já existe
        existing_username = UserService.get_user_by_username(db, user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username já cadastrado"
            )
        
        user = UserService.create_user(db, user_data)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

@router.get("/", response_model=UserList)
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter lista de usuários."""
    try:
        if search:
            users = UserService.search_users(db, search, skip, limit)
        else:
            users = UserService.get_users(db, skip, limit)
        
        total = len(users)
        
        return UserList(
            users=users,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuários: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """Obter perfil do usuário atual."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar perfil do usuário atual."""
    try:
        # Não permitir alterar email e username
        if user_data.email and user_data.email != current_user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email não pode ser alterado"
            )
        
        if user_data.username and user_data.username != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username não pode ser alterado"
            )
        
        user = UserService.update_user(db, current_user.id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter usuário por ID."""
    try:
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Atualizar usuário (apenas admin)."""
    try:
        user = UserService.update_user(db, user_id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao atualizar usuário: {str(e)}"
        )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deletar usuário (apenas admin)."""
    try:
        # Não permitir deletar a si mesmo
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível deletar seu próprio usuário"
            )
        
        success = UserService.delete_user(db, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar usuário: {str(e)}"
        )