# ===========================================
# APLICAÇÃO PRINCIPAL FASTAPI
# ===========================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
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

limiter = Limiter(key_func=get_remote_address)

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

# Adicionar rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ===========================================
# MIDDLEWARES
# ===========================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
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
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco: {e}")
    
    # Inicializar Redis
    try:
        from app.core.redis import redis_client
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
        from app.core.redis import redis_client
        await redis_client.close()
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
    try:
        # Verificar banco de dados
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        # Verificar Redis
        from app.core.redis import redis_client
        await redis_client.ping()
        
        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
        )

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

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Tratador para erros internos do servidor."""
    logger.error(f"Internal server error: {exc}")
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

