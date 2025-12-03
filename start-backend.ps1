# ===========================================
# Script para iniciar o Backend (FastAPI)
# ===========================================

Write-Host "🚀 Iniciando Backend..." -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do backend
Set-Location backend

# Verificar se existe arquivo .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️ Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "📋 Copiando env.example para .env..." -ForegroundColor Yellow
    Copy-Item ..\env.example .env -ErrorAction SilentlyContinue
    Write-Host "✅ Arquivo .env criado. Configure as variáveis de ambiente se necessário." -ForegroundColor Green
    Write-Host ""
}

# Verificar se existe ambiente virtual
if (-not (Test-Path venv)) {
    Write-Host "📦 Criando ambiente virtual..." -ForegroundColor Yellow
    python -m venv venv
}

# Ativar ambiente virtual
Write-Host "🔧 Ativando ambiente virtual..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Instalar dependências se necessário
Write-Host "📥 Verificando dependências..." -ForegroundColor Cyan
pip install -q -r requirements.txt 2>&1 | Out-Null

Write-Host ""
Write-Host "✅ Backend pronto!" -ForegroundColor Green
Write-Host "🌐 Iniciando servidor na porta 8000..." -ForegroundColor Cyan
Write-Host "📖 Documentação: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "🔍 Health Check: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload



