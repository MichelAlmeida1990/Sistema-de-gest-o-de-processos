# ===========================================
# ROUTER PRINCIPAL DA API V1
# ===========================================

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, processes, tasks, files, notifications, timeline, reports, websocket, admin, datajud, pdf_reports

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

# Tarefas
api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["Tarefas"]
)

# Arquivos
api_router.include_router(
    files.router,
    prefix="/files",
    tags=["Arquivos"]
)

# Notificações
api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["Notificações"]
)

# Timeline
api_router.include_router(
    timeline.router,
    prefix="/timeline",
    tags=["Timeline"]
)

# Relatórios
api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Relatórios"]
)

# WebSocket
api_router.include_router(
    websocket.router,
    prefix="/ws",
    tags=["WebSocket"]
)

# Administração
api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administração"]
)

# DataJud (CNJ)
api_router.include_router(
    datajud.router,
    prefix="/datajud",
    tags=["DataJud (CNJ)"]
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

