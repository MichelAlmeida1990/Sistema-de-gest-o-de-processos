# ===========================================
# Script para iniciar o Frontend (React + Vite)
# ===========================================

Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do frontend
Set-Location frontend

# Verificar se node_modules existe
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar se existe arquivo .env.local
if (-not (Test-Path .env.local)) {
    Write-Host "⚠️ Arquivo .env.local não encontrado!" -ForegroundColor Yellow
    Write-Host "📋 Criando .env.local com configuração local..." -ForegroundColor Yellow
    
    $envContent = @"
# Configuração para desenvolvimento local
VITE_API_URL=http://localhost:8000/api/v1
"@
    Set-Content -Path .env.local -Value $envContent
    Write-Host "✅ Arquivo .env.local criado com VITE_API_URL=http://localhost:8000/api/v1" -ForegroundColor Green
    Write-Host ""
}

Write-Host "✅ Frontend pronto!" -ForegroundColor Green
Write-Host "🌐 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "📖 Aplicação: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor de desenvolvimento
npm run dev



