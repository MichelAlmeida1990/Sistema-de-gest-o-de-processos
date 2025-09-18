# ===========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ===========================================

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging

from app.core.config import settings, get_database_url

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
elif settings.ENVIRONMENT == "production":
    # Configurações para produção
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 30,
        "pool_timeout": 30,
    })

# Criar engine do SQLAlchemy
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
# BASE PARA MODELOS
# ===========================================

# Metadados com convenções de nomenclatura
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    }
)

Base = declarative_base(metadata=metadata)

# ===========================================
# DEPENDÊNCIA PARA SESSÕES
# ===========================================

def get_db():
    """
    Dependency para obter sessão do banco de dados.
    Usado com Depends() no FastAPI.
    """
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
# FUNÇÕES ÚTEIS
# ===========================================

def create_tables():
    """Criar todas as tabelas do banco."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas criadas com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise

def drop_tables():
    """Remover todas as tabelas do banco."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("✅ Tabelas removidas com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao remover tabelas: {e}")
        raise

def check_connection():
    """Verificar se a conexão com o banco está funcionando."""
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
        logger.info("✅ Conexão com banco verificada")
        return True
    except Exception as e:
        logger.error(f"❌ Erro na conexão com banco: {e}")
        return False

# ===========================================
# CONFIGURAÇÃO PARA TESTES
# ===========================================

def get_test_db():
    """Obter sessão de banco para testes."""
    # Em testes, usar SQLite em memória
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    
    # Criar tabelas
    Base.metadata.create_all(bind=test_engine)
    
    return TestingSessionLocal()

