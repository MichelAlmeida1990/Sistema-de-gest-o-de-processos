# ===========================================
# ROUTER PRINCIPAL DA API V1
# ===========================================

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, processes, tasks, files, notifications, timeline, reports, websocket, admin, datajud, funnel, financial, dashboard, reports_export, rdstation, precatorios, indices_economicos

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

# Precatórios
api_router.include_router(
    precatorios.router,
    prefix="/precatorios",
    tags=["Precatórios"]
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

# Exportação de Relatórios
api_router.include_router(
    reports_export.router,
    prefix="/reports",
    tags=["Exportação de Relatórios"]
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

# Funil de Processos
api_router.include_router(
    funnel.router,
    prefix="/funnel",
    tags=["Funil de Processos"]
)

# Financeiro
api_router.include_router(
    financial.router,
    prefix="/financial",
    tags=["Financeiro"]
)

# Dashboard
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# RD Station
api_router.include_router(
    rdstation.router,
    prefix="/rdstation",
    tags=["RD Station"]
)

# Índices Econômicos (Banco Central)
api_router.include_router(
    indices_economicos.router,
    prefix="/indices-economicos",
    tags=["Índices Econômicos"]
)

# Relatórios PDF - TEMPORARIAMENTE DESABILITADO
# api_router.include_router(
#     pdf_reports.router,
#     prefix="/pdf-reports",
#     tags=["Relatórios PDF"]
# )

# Sistema de Email - TEMPORARIAMENTE DESABILITADO
# api_router.include_router(
#     email.router,
#     prefix="/email",
#     tags=["Sistema de Email"]
# )

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

