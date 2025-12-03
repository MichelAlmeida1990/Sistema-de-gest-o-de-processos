# ===========================================
# APLICAÇÃO PRINCIPAL FASTAPI
# ===========================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    SLOWAPI_AVAILABLE = True
except ImportError:
    SLOWAPI_AVAILABLE = False
    Limiter = None
    RateLimitExceeded = None
    _rate_limit_exceeded_handler = None
import time
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.core.exceptions import CustomException

# ===========================================
# CONFIGURAÇÃO DE LOGGING
# ===========================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ===========================================
# CONFIGURAÇÃO DO RATE LIMITER
# ===========================================

if SLOWAPI_AVAILABLE:
    try:
        limiter = Limiter(key_func=get_remote_address)
    except Exception:
        limiter = None
else:
    limiter = None

# ===========================================
# CRIAÇÃO DA APLICAÇÃO FASTAPI
# ===========================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Adicionar rate limiter (se disponível)
if SLOWAPI_AVAILABLE and limiter and RateLimitExceeded and _rate_limit_exceeded_handler:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ===========================================
# MIDDLEWARES
# ===========================================

# CORS
# Preparar origens permitidas
allowed_origins = settings.ALLOWED_HOSTS.copy() if isinstance(settings.ALLOWED_HOSTS, list) else list(settings.ALLOWED_HOSTS)

# Se ALLOWED_HOSTS contém "*", permitir todas as origens (incluindo localhost)
if "*" in allowed_origins:
    allowed_origins = ["*"]
    logger.info("CORS: Permitindo todas as origens (*)")
else:
    # Sempre adicionar localhost em desenvolvimento ou se não estiver na lista
    localhost_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ]
    # Adicionar localhost se não estiver na lista
    for origin in localhost_origins:
        if origin not in allowed_origins:
            allowed_origins.append(origin)
    logger.info(f"CORS: Origens permitidas: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host (apenas em produção)
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# Middleware de logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log da requisição
    logger.info(f"Request: {request.method} {request.url}")
    
    # Processar requisição
    response = await call_next(request)
    
    # Calcular tempo de processamento
    process_time = time.time() - start_time
    
    # Log da resposta
    logger.info(
        f"Response: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    
    # Adicionar header com tempo de processamento
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# ===========================================
# EVENTOS DA APLICAÇÃO
# ===========================================

@app.on_event("startup")
async def startup_event():
    """Eventos executados na inicialização da aplicação."""
    logger.info("🚀 Iniciando aplicação...")
    
    # Criar tabelas do banco de dados
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Banco de dados inicializado")
        
        # Criar usuário admin automaticamente
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.services.auth import AuthService
        
        db = SessionLocal()
        from app.models.user import UserRole
        try:
            # Criar/garantir ADMIN (independente do DEMO)
            try:
                admin_user = db.query(User).filter(User.email == "admin@sistema.com").first()
                if not admin_user:
                    admin_user = User(
                        email="admin@sistema.com",
                        username="admin",
                        full_name="Administrador",
                        hashed_password=AuthService.get_password_hash("123456"),
                        is_active=True,
                        is_verified=True,
                        role=UserRole.ADMIN
                    )
                    db.add(admin_user)
                    db.commit()
                    logger.info("✅ Usuário admin criado automaticamente")
                else:
                    logger.info("✅ Usuário admin já existe")
            except Exception as e:
                logger.error(f"❌ Erro ao criar/garantir usuário admin: {e}")
                db.rollback()

            # Criar/garantir DEMO (não-admin), mesmo que admin falhe
            try:
                demo_user = db.query(User).filter(User.email == "demo@demo.com").first()
                if not demo_user:
                    demo_user = User(
                        email="demo@demo.com",
                        username="demo",
                        full_name="Usuário Demo",
                        hashed_password=AuthService.get_password_hash("demo123"),
                        is_active=True,
                        is_verified=True,
                        role=UserRole.ASSISTANT
                    )
                    db.add(demo_user)
                    db.commit()
                    logger.info("✅ Usuário DEMO criado (demo@demo.com / demo123)")
                else:
                    logger.info("✅ Usuário DEMO já existe")
            except Exception as e:
                logger.error(f"❌ Erro ao criar/garantir usuário DEMO: {e}")
                db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco: {e}")
    
    # Inicializar Redis
    try:
        from app.core.redis import get_redis
        redis_client = await get_redis()
        await redis_client.ping()
        logger.info("✅ Redis conectado")
    except Exception as e:
        logger.error(f"❌ Erro ao conectar Redis: {e}")
    
    logger.info("🎉 Aplicação iniciada com sucesso!")

@app.on_event("shutdown")
async def shutdown_event():
    """Eventos executados no encerramento da aplicação."""
    logger.info("🛑 Encerrando aplicação...")
    
    # Fechar conexões
    try:
        from app.core.redis import close_redis
        await close_redis()
        logger.info("✅ Conexões fechadas")
    except Exception as e:
        logger.error(f"❌ Erro ao fechar conexões: {e}")
    
    logger.info("👋 Aplicação encerrada")

# ===========================================
# ROTAS
# ===========================================

# Incluir rotas da API
app.include_router(api_router, prefix=settings.API_V1_STR)

# ===========================================
# ROTAS BÁSICAS
# ===========================================

@app.get("/")
async def root():
    """Rota raiz da aplicação."""
    return {
        "message": "Sistema de Gestão de Processos e Cálculos",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da aplicação."""
    import time
    # Health check simples - sempre retorna OK se o servidor está rodando
    db_status = "unknown"
    redis_status = "unknown"
    
    # Verificar banco de dados (opcional)
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as db_error:
        logger.warning(f"Database not available: {db_error}")
        db_status = "disconnected"
    
    # Redis é opcional
    try:
        from app.core.redis import get_redis
        redis_client = await get_redis()
        await redis_client.ping()
        redis_status = "connected"
    except Exception as redis_error:
        logger.warning(f"Redis not available: {redis_error}")
        redis_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "redis": redis_status,
        "timestamp": time.time(),
        "version": settings.VERSION
    }

# ===========================================
# TRATAMENTO DE EXCEÇÕES
# ===========================================

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    """Tratador de exceções customizadas."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Tratador para rotas não encontradas."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "NOT_FOUND",
            "message": "Rota não encontrada",
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Tratador genérico para todas as exceções."""
    import traceback
    error_details = str(exc)
    traceback_str = traceback.format_exc()
    
    logger.error(f"Unhandled exception: {exc}")
    logger.error(f"Traceback: {traceback_str}")
    
    # Em desenvolvimento, mostrar mais detalhes
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_ERROR",
                "message": "Erro interno do servidor",
                "details": error_details,
                "traceback": traceback_str.split('\n')[-5:] if settings.DEBUG else None
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_ERROR",
                "message": "Erro interno do servidor"
            }
        )

# ===========================================
# CONFIGURAÇÃO PARA DESENVOLVIMENTO
# ===========================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )

