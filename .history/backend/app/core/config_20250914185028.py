# ===========================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ===========================================

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    """Configurações da aplicação usando Pydantic."""
    
    # ===========================================
    # INFORMAÇÕES BÁSICAS
    # ===========================================
    PROJECT_NAME: str = "Sistema de Gestão de Processos"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Sistema web para controle de processos e gestão de cálculos"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # ===========================================
    # API
    # ===========================================
    API_V1_STR: str = "/api/v1"
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # ===========================================
    # BANCO DE DADOS
    # ===========================================
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "gestao_processos")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres123")
    
    @property
    def DATABASE_URL(self) -> str:
        """URL de conexão com o banco PostgreSQL."""
        # Usar DATABASE_URL do ambiente se disponível
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        
        # Caso contrário, construir a URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    # ===========================================
    # REDIS
    # ===========================================
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    
    @property
    def REDIS_URL(self) -> str:
        """URL de conexão com o Redis."""
        if self.REDIS_PASSWORD:
            return (
                f"redis://:{self.REDIS_PASSWORD}@"
                f"{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
            )
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # ===========================================
    # SEGURANÇA
    # ===========================================
    SECRET_KEY: str = "your-super-secret-key-change-in-production-123456789"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Criptografia
    ENCRYPTION_KEY: str = "your-encryption-key-32-characters"
    
    # 2FA
    TOTP_ISSUER: str = "Gestão Processos"
    
    # ===========================================
    # API EXTERNA - DATAJUD
    # ===========================================
    DATAJUD_BASE_URL: str = "https://api.datajud.cnj.jus.br"
    DATAJUD_API_TOKEN: Optional[str] = None
    DATAJUD_TIMEOUT: int = 30
    
    # ===========================================
    # UPLOAD DE ARQUIVOS
    # ===========================================
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ]
    
    # ===========================================
    # EMAIL
    # ===========================================
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: str = "noreply@gestaoprocessos.com"
    FROM_NAME: str = "Sistema Gestão Processos"
    
    # ===========================================
    # LOGGING
    # ===========================================
    LOG_LEVEL: str = "INFO"
    LOG_DIR: str = "./logs"
    SENTRY_DSN: Optional[str] = None
    
    # ===========================================
    # RATE LIMITING
    # ===========================================
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # ===========================================
    # BACKUP
    # ===========================================
    BACKUP_DIR: str = "./backups"
    BACKUP_CRON: str = "0 2 * * *"  # Diário às 2h
    BACKUP_RETENTION_DAYS: int = 30
    
    # ===========================================
    # CONFIGURAÇÕES DE NEGÓCIO
    # ===========================================
    DEFAULT_CURRENCY: str = "BRL"
    TIMEZONE: str = "America/Sao_Paulo"
    DATE_FORMAT: str = "%d/%m/%Y"
    DATETIME_FORMAT: str = "%d/%m/%Y %H:%M:%S"
    
    # ===========================================
    # VALIDAÇÕES
    # ===========================================
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        """Validar se a chave secreta é segura."""
        if len(v) < 32:
            raise ValueError("SECRET_KEY deve ter pelo menos 32 caracteres")
        return v
    
    # @validator("ENCRYPTION_KEY")
    # def validate_encryption_key(cls, v):
    #     """Validar se a chave de criptografia é válida."""
    #     if len(v) != 32:
    #         raise ValueError("ENCRYPTION_KEY deve ter exatamente 32 caracteres")
    #     return v
    
    @validator("ALLOWED_HOSTS")
    def validate_allowed_hosts(cls, v):
        """Validar hosts permitidos."""
        if "*" in v and len(v) > 1:
            raise ValueError("Não é possível usar '*' com outros hosts")
        return v
    
    class Config:
        """Configurações do Pydantic."""
        env_file = ".env"
        case_sensitive = True


# Instância global das configurações
settings = Settings()

# ===========================================
# CONFIGURAÇÕES POR AMBIENTE
# ===========================================

def get_database_url() -> str:
    """Obter URL do banco baseada no ambiente."""
    if settings.ENVIRONMENT == "production":
        # Em produção, usar variável de ambiente direta
        return os.getenv("DATABASE_URL", settings.DATABASE_URL)
    return settings.DATABASE_URL

def get_redis_url() -> str:
    """Obter URL do Redis baseada no ambiente."""
    if settings.ENVIRONMENT == "production":
        # Em produção, usar variável de ambiente direta
        return os.getenv("REDIS_URL", settings.REDIS_URL)
    return settings.REDIS_URL

def is_development() -> bool:
    """Verificar se está em ambiente de desenvolvimento."""
    return settings.ENVIRONMENT == "development"

def is_production() -> bool:
    """Verificar se está em ambiente de produção."""
    return settings.ENVIRONMENT == "production"

