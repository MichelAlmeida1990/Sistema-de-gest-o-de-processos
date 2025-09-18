# ===========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ===========================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging

from app.core.config import settings, get_database_url
from app.core.base import Base

logger = logging.getLogger(__name__)

# ===========================================
# CONFIGURAÇÃO DO ENGINE
# ===========================================

# Configurações do engine baseadas no ambiente
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

if settings.ENVIRONMENT == "development":
    # Configurações para desenvolvimento
    engine_kwargs.update({
        "echo": settings.DEBUG,
        "echo_pool": settings.DEBUG,
    })

# Se for SQLite, usar pool estático
if "sqlite" in get_database_url():
    engine_kwargs["poolclass"] = StaticPool
    engine_kwargs["connect_args"] = {"check_same_thread": False}

# Criar engine
engine = create_engine(
    get_database_url(),
    **engine_kwargs
)

# ===========================================
# SESSION FACTORY
# ===========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ===========================================
# DEPENDÊNCIA PARA SESSÕES
# ===========================================

def get_db():
    """Dependência para obter sessão do banco."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Erro na sessão do banco: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# ===========================================
# CONTEXTO DE SESSÃO
# ===========================================

class DatabaseContext:
    """Contexto para gerenciar sessões do banco."""
    
    def __init__(self):
        self.db = None
    
    def __enter__(self):
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
        else:
            self.db.commit()
        self.db.close()

# ===========================================
# FUNÇÕES UTILITÁRIAS
# ===========================================

def create_tables():
    """Criar todas as tabelas."""
    # Importar todos os modelos para garantir que sejam registrados
    import app.models  # noqa
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Remover todas as tabelas."""
    # Importar todos os modelos para garantir que sejam registrados
    from app.models import *  # noqa
    Base.metadata.drop_all(bind=engine)

def reset_database():
    """Resetar banco de dados (remover e recriar tabelas)."""
    logger.warning("⚠️ Resetando banco de dados...")
    drop_tables()
    create_tables()
    logger.info("✅ Banco de dados resetado")

# ===========================================
# VERIFICAÇÃO DE SAÚDE
# ===========================================

def check_database_health() -> bool:
    """Verificar saúde da conexão com o banco."""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Health check do banco falhou: {e}")
        return False