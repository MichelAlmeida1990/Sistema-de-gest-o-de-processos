# ===========================================
# ENDPOINTS DE ARQUIVOS
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import aiofiles
import os
import hashlib
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.file import FileCreate, FileResponse, FileList
from app.services.file import FileService

router = APIRouter()

# Configuração de upload
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    process_id: Optional[int] = Form(None),
    file_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload de arquivo."""
    try:
        # Validar tamanho do arquivo
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Arquivo muito grande. Máximo 50MB."
            )
        
        # Criar diretório se não existir
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Gerar nome único para o arquivo
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Salvar arquivo
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Calcular hashes
        hash_md5 = hashlib.md5(content).hexdigest()
        hash_sha256 = hashlib.sha256(content).hexdigest()
        
        # Criar registro no banco
        file_data = FileCreate(
            filename=filename,
            original_filename=file.filename,
            file_size=file.size,
            mime_type=file.content_type,
            file_type=file_type,
            title=title,
            description=description,
            process_id=process_id
        )
        
        file_record = FileService.create_file(db, file_data, current_user.id)
        
        # Atualizar hashes
        file_record.hash_md5 = hash_md5
        file_record.hash_sha256 = hash_sha256
        file_record.file_path = file_path
        
        db.commit()
        db.refresh(file_record)
        
        return file_record
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao fazer upload: {str(e)}"
        )

@router.get("/", response_model=FileList)
async def get_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    process_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter lista de arquivos."""
    try:
        if process_id:
            files = FileService.get_process_files(db, process_id, skip, limit)
        else:
            files = FileService.get_files(db, skip, limit)
        
        total = len(files)
        
        return FileList(
            files=files,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar arquivos: {str(e)}"
        )

@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter arquivo por ID."""
    try:
        file_record = FileService.get_file_by_id(db, file_id)
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo não encontrado"
            )
        return file_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar arquivo: {str(e)}"
        )

@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download de arquivo."""
    try:
        file_record = FileService.get_file_by_id(db, file_id)
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo não encontrado"
            )
        
        if not os.path.exists(file_record.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo físico não encontrado"
            )
        
        # Retornar arquivo para download
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_record.file_path,
            filename=file_record.original_filename,
            media_type=file_record.mime_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer download: {str(e)}"
        )

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar arquivo."""
    try:
        file_record = FileService.get_file_by_id(db, file_id)
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo não encontrado"
            )
        
        # Deletar arquivo físico
        if os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)
        
        # Deletar registro no banco
        success = FileService.delete_file(db, file_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao deletar arquivo do banco"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar arquivo: {str(e)}"
        )
