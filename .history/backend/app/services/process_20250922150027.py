# ===========================================
# SERVIÇO DE PROCESSO
# ===========================================

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.process import Process
from app.schemas.process import ProcessCreate, ProcessUpdate

class ProcessService:
    """Serviço para gerenciar processos."""
    
    @staticmethod
    def create_process(db: Session, process_data: ProcessCreate, user_id: int) -> Process:
        """Criar novo processo."""
        process = Process(
            **process_data.dict(),
            user_id=user_id
        )
        
        db.add(process)
        db.commit()
        db.refresh(process)
        
        return process
    
    @staticmethod
    def get_process_by_id(db: Session, process_id: int) -> Optional[Process]:
        """Obter processo por ID."""
        return db.query(Process).filter(Process.id == process_id).first()
    
    @staticmethod
    def get_processes(db: Session, skip: int = 0, limit: int = 100) -> List[Process]:
        """Obter lista de processos."""
        return db.query(Process).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_user_processes(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Process]:
        """Obter processos de um usuário."""
        return db.query(Process).filter(Process.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def search_processes(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Process]:
        """Buscar processos por título ou cliente."""
        search_filter = or_(
            Process.title.ilike(f"%{query}%"),
            Process.client_name.ilike(f"%{query}%"),
            Process.process_number.ilike(f"%{query}%")
        )
        
        return db.query(Process).filter(search_filter).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_process(db: Session, process_id: int, process_data: ProcessUpdate) -> Optional[Process]:
        """Atualizar processo."""
        process = ProcessService.get_process_by_id(db, process_id)
        if not process:
            return None
        
        update_data = process_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(process, field, value)
        
        db.commit()
        db.refresh(process)
        
        return process
    
    @staticmethod
    def delete_process(db: Session, process_id: int) -> bool:
        """Deletar processo."""
        process = ProcessService.get_process_by_id(db, process_id)
        if not process:
            return False
        
        db.delete(process)
        db.commit()
        
        return True









