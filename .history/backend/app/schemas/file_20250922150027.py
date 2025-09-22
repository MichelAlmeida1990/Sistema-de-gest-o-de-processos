# ===========================================
# SCHEMAS DE ARQUIVO
# ===========================================

from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

from app.models.file import FileType
from app.schemas.common import BaseResponse

class FileCreate(BaseModel):
    """Schema para criação de arquivo."""
    filename: str = Field(..., min_length=1, max_length=255)
    original_filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0)
    mime_type: str
    file_type: FileType
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    process_id: Optional[int] = None

class FileResponse(BaseResponse):
    """Schema para resposta de arquivo."""
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    file_type: FileType
    title: Optional[str]
    description: Optional[str]
    hash_md5: Optional[str]
    hash_sha256: Optional[str]
    process_id: Optional[int]
    uploaded_by_id: int

class FileList(BaseModel):
    """Schema para lista de arquivos."""
    files: list[FileResponse]
    total: int
    page: int
    per_page: int









