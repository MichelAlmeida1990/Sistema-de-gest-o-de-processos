# ===========================================
# MODELO DE ARQUIVO
# ===========================================

from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel

class FileType(PyEnum):
    """Tipo de arquivo."""
    DOCUMENT = "document"
    IMAGE = "image"
    PDF = "pdf"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    OTHER = "other"

class File(BaseModel):
    """Modelo de arquivo."""
    
    __tablename__ = "files"
    
    # Informações básicas
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # em bytes
    mime_type = Column(String(100), nullable=False)
    file_type = Column(Enum(FileType), nullable=False)
    
    # Descrição
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Metadados
    hash_md5 = Column(String(32), nullable=True)
    hash_sha256 = Column(String(64), nullable=True)
    
    # Relacionamentos
    process_id = Column(ForeignKey("processes.id"), nullable=True)
    process = relationship("Process", back_populates="files")
    
    uploaded_by_id = Column(ForeignKey("users.id"), nullable=False)
    uploaded_by = relationship("User")
    
    def __repr__(self):
        return f"<File(id={self.id}, filename='{self.filename}', size={self.file_size})>"
