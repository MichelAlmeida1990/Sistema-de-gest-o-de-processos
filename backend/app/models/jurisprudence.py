# ===========================================
# MODELO DE JURISPRUDÊNCIA
# ===========================================

from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel


class JurisprudenceStatus(PyEnum):
    """Status da análise de jurisprudência."""
    PENDING = "pending"  # Aguardando análise
    ANALYZING = "analyzing"  # Em análise
    COMPLETED = "completed"  # Concluído
    FAILED = "failed"  # Falhou


class Jurisprudence(BaseModel):
    """Modelo de análise de jurisprudência."""
    
    __tablename__ = "jurisprudences"
    
    # Informações do processo/jurisprudência
    process_number = Column(String(100), nullable=True)  # Número do processo
    tribunal = Column(String(100), nullable=True)  # Tribunal
    court = Column(String(100), nullable=True)  # Vara/Órgão julgador
    decision_date = Column(DateTime(timezone=True), nullable=True)  # Data da decisão
    
    # Conteúdo
    title = Column(String(500), nullable=False)  # Título/resumo
    full_text = Column(Text, nullable=True)  # Texto completo da decisão
    summary = Column(Text, nullable=True)  # Resumo gerado pela IA
    keywords = Column(JSON, nullable=True)  # Palavras-chave extraídas
    
    # Análise IA
    ai_analysis = Column(JSON, nullable=True)  # Análise completa com IA
    key_points = Column(JSON, nullable=True)  # Pontos chave identificados
    legal_basis = Column(JSON, nullable=True)  # Fundamentação legal
    arguments = Column(JSON, nullable=True)  # Argumentos estratégicos gerados
    
    # Comparação
    similar_cases = Column(JSON, nullable=True)  # Casos similares
    comparison_analysis = Column(JSON, nullable=True)  # Análise comparativa
    
    # Status
    status = Column(Enum(JurisprudenceStatus), default=JurisprudenceStatus.PENDING, nullable=False)
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=True)  # Usuário que criou
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<Jurisprudence(id={self.id}, title='{self.title[:50]}...', status='{self.status.value}')>"


class JurisprudenceChat(BaseModel):
    """Modelo de conversa/chat sobre jurisprudência."""
    
    __tablename__ = "jurisprudence_chats"
    
    # Informações da conversa
    title = Column(String(255), nullable=True)  # Título da conversa
    messages = Column(JSON, nullable=False)  # Histórico de mensagens
    
    # Relacionamentos
    user_id = Column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", foreign_keys=[user_id])
    
    # Jurisprudência relacionada (opcional)
    jurisprudence_id = Column(ForeignKey("jurisprudences.id"), nullable=True)
    jurisprudence = relationship("Jurisprudence", foreign_keys=[jurisprudence_id])
    
    def __repr__(self):
        return f"<JurisprudenceChat(id={self.id}, user_id={self.user_id}, messages_count={len(self.messages) if self.messages else 0})>"



