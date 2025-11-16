# Script para iniciar o frontend com backend local
Write-Host "🚀 Iniciando frontend com backend local..." -ForegroundColor Cyan
Write-Host ""

# Configurar variável de ambiente
$env:VITE_API_URL = "http://localhost:8000/api/v1"
$env:VITE_API_BASE_URL = "http://localhost:8000/api/v1"

Write-Host "✅ Variáveis configuradas:" -ForegroundColor Green
Write-Host "   VITE_API_URL = $env:VITE_API_URL" -ForegroundColor Yellow
Write-Host ""

# Verificar se o backend está rodando
Write-Host "🔍 Verificando backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend está rodando!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend NÃO está rodando em http://localhost:8000" -ForegroundColor Yellow
    Write-Host "   Inicie o backend primeiro:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "📦 Iniciando servidor Vite..." -ForegroundColor Cyan
Write-Host ""

# Iniciar o servidor Vite
npm run dev

