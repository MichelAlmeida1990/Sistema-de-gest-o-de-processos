# ===========================================
# Script para iniciar Backend e Frontend simultaneamente
# ===========================================

Write-Host "🚀 Iniciando Backend e Frontend..." -ForegroundColor Cyan
Write-Host ""

# Criar jobs para rodar em paralelo
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    if (-not (Test-Path .env)) {
        Copy-Item ..\env.example .env -ErrorAction SilentlyContinue
    }
    if (-not (Test-Path venv)) {
        python -m venv venv
    }
    & .\venv\Scripts\Activate.ps1
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    if (-not (Test-Path node_modules)) {
        npm install
    }
    if (-not (Test-Path .env.local)) {
        "VITE_API_URL=http://localhost:8000/api/v1" | Out-File -FilePath .env.local
    }
    npm run dev
}

Write-Host "✅ Backend iniciado em background (porta 8000)" -ForegroundColor Green
Write-Host "✅ Frontend iniciado em background (porta 3000)" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Backend: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "📖 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para parar os servidores, execute:" -ForegroundColor Gray
Write-Host "  Stop-Job -Job `$backendJob, `$frontendJob" -ForegroundColor Gray
Write-Host "  Remove-Job -Job `$backendJob, `$frontendJob" -ForegroundColor Gray
Write-Host ""

# Aguardar jobs
Wait-Job -Job $backendJob, $frontendJob

