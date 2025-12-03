# ===========================================
# MODELO DE DIAGNÓSTICO JURÍDICO
# ===========================================

from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Numeric, JSON, Boolean
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from datetime import datetime

from .base import BaseModel


class DiagnosisStatus(PyEnum):
    """Status do diagnóstico."""
    PENDING = "pending"  # Aguardando análise
    ANALYZING = "analyzing"  # Em análise
    COMPLETED = "completed"  # Concluído
    FAILED = "failed"  # Falhou


class DiagnosisPriority(PyEnum):
    """Prioridade do caso."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class LegalDiagnosis(BaseModel):
    """Modelo de diagnóstico jurídico."""
    
    __tablename__ = "legal_diagnoses"
    
    # Informações do cliente
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=True)
    client_phone = Column(String(20), nullable=True)
    client_document = Column(String(20), nullable=True)
    
    # Descrição do caso
    case_description = Column(Text, nullable=False)
    case_category = Column(String(100), nullable=True)  # Ex: Trabalhista, Civil, etc.
    case_type = Column(String(100), nullable=True)  # Ex: Rescisão, Cobrança, etc.
    
    # Análise IA
    ai_analysis = Column(JSON, nullable=True)  # Resultado da análise com IA
    key_issues = Column(JSON, nullable=True)  # Questões chave identificadas
    possible_solutions = Column(JSON, nullable=True)  # Possíveis soluções
    success_probability = Column(Numeric(5, 2), nullable=True)  # Probabilidade de êxito (0-100)
    risk_level = Column(String(20), nullable=True)  # low, medium, high
    
    # Recomendações
    recommendations = Column(Text, nullable=True)
    estimated_value = Column(Numeric(15, 2), nullable=True)  # Valor estimado do caso
    estimated_duration = Column(String(50), nullable=True)  # Duração estimada
    
    # Status
    status = Column(Enum(DiagnosisStatus), default=DiagnosisStatus.PENDING, nullable=False)
    priority = Column(Enum(DiagnosisPriority), default=DiagnosisPriority.MEDIUM, nullable=False)
    
    # Agendamento
    consultation_scheduled = Column(Boolean, default=False, nullable=False)
    consultation_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=True)  # Advogado responsável
    user = relationship("User", foreign_keys=[user_id])
    
    # Arquivos anexados
    files = relationship("File", foreign_keys="File.diagnosis_id", back_populates="diagnosis")
    
    def __repr__(self):
        return f"<LegalDiagnosis(id={self.id}, client='{self.client_name}', status='{self.status.value}')>"

