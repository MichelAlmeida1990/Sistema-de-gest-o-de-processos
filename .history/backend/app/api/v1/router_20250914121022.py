# ===========================================
# ROUTER PRINCIPAL DA API V1
# ===========================================

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, processes, tasks, deliveries, financial, admin

# ===========================================
# ROUTER PRINCIPAL
# ===========================================

api_router = APIRouter()

# ===========================================
# INCLUIR ROTAS DOS MÓDULOS
# ===========================================

# Autenticação
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Autenticação"]
)

# Usuários
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Usuários"]
)

# Processos
api_router.include_router(
    processes.router,
    prefix="/processes",
    tags=["Processos"]
)

# Tarefas de Cálculo
api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["Tarefas de Cálculo"]
)

# Entregas
api_router.include_router(
    deliveries.router,
    prefix="/deliveries",
    tags=["Entregas"]
)

# Financeiro
api_router.include_router(
    financial.router,
    prefix="/financial",
    tags=["Financeiro"]
)

# Administração
api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administração"]
)

# ===========================================
# ROTA DE STATUS DA API
# ===========================================

@api_router.get("/status")
async def api_status():
    """Status da API v1."""
    return {
        "status": "active",
        "version": "1.0.0",
        "message": "API v1 funcionando corretamente"
    }

