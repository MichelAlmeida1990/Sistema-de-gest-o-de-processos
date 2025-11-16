# Script para configurar ambiente de desenvolvimento local
Write-Host "🔧 Configurando ambiente de desenvolvimento local..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o backend está rodando
Write-Host "🔍 Verificando se o backend está rodando..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend está rodando em http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend NÃO está rodando em http://localhost:8000" -ForegroundColor Yellow
    Write-Host "   Inicie o backend antes de rodar o frontend:" -ForegroundColor Yellow
    Write-Host "   cd backend && uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host ""
}

# Configurar variável de ambiente para usar backend local
$env:VITE_API_URL = "http://localhost:8000/api/v1"
$env:VITE_API_BASE_URL = "http://localhost:8000/api/v1"
$env:VITE_APP_ENV = "development"
$env:VITE_DEBUG = "true"

Write-Host ""
Write-Host "✅ Variáveis de ambiente configuradas:" -ForegroundColor Green
Write-Host "   VITE_API_URL=$env:VITE_API_URL" -ForegroundColor Yellow
Write-Host "   VITE_API_BASE_URL=$env:VITE_API_BASE_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Agora você pode executar:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dica: Essas variáveis são válidas apenas nesta sessão do PowerShell." -ForegroundColor Cyan
Write-Host "   Para tornar permanente, crie um arquivo .env.local na pasta frontend/" -ForegroundColor Cyan

