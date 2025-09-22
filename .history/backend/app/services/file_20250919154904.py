# ===========================================
# SERVIÇO DE ARQUIVO
# ===========================================

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.file import File
from app.schemas.file import FileCreate

class FileService:
    """Serviço para gerenciar arquivos."""
    
    @staticmethod
    def create_file(db: Session, file_data: FileCreate, uploaded_by_id: int) -> File:
        """Criar novo arquivo."""
        file = File(
            **file_data.dict(),
            uploaded_by_id=uploaded_by_id
        )
        
        db.add(file)
        db.commit()
        db.refresh(file)
        
        return file
    
    @staticmethod
    def get_file_by_id(db: Session, file_id: int) -> Optional[File]:
        """Obter arquivo por ID."""
        return db.query(File).filter(File.id == file_id).first()
    
    @staticmethod
    def get_files(db: Session, skip: int = 0, limit: int = 100) -> List[File]:
        """Obter lista de arquivos."""
        return db.query(File).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_process_files(db: Session, process_id: int, skip: int = 0, limit: int = 100) -> List[File]:
        """Obter arquivos de um processo."""
        return db.query(File).filter(File.process_id == process_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def delete_file(db: Session, file_id: int) -> bool:
        """Deletar arquivo."""
        file = FileService.get_file_by_id(db, file_id)
        if not file:
            return False
        
        db.delete(file)
        db.commit()
        
        return True






