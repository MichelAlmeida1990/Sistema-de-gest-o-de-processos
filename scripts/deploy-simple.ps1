# Script simples de deploy para Vercel
Write-Host "🚀 Preparando deploy na Vercel..." -ForegroundColor Blue

# Verificar se está no diretório correto
if (-not (Test-Path "frontend\package.json")) {
    Write-Host "❌ Execute na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Fazer build do frontend
Write-Host "🏗️ Fazendo build do frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído!" -ForegroundColor Green
} else {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Gerar chaves se não existirem
if (-not (Test-Path ".env.production.keys")) {
    Write-Host "🔐 Gerando chaves de segurança..." -ForegroundColor Yellow
    Set-Location scripts
    python generate-keys.py
    Set-Location ..
}

Write-Host "`n🎉 Sistema pronto para deploy!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Selecione seu repositório GitHub" -ForegroundColor White
Write-Host "3. Configure Root Directory: frontend" -ForegroundColor White
Write-Host "4. Configure variáveis de ambiente" -ForegroundColor White
Write-Host "`n📖 Guia completo: DEPLOY_VERCEL.md" -ForegroundColor Cyan

# Abrir URLs
$open = Read-Host "`nAbrir Vercel no navegador? (y/N)"
if ($open -eq "y") {
    Start-Process "https://vercel.com/new"
    Start-Process "https://railway.app/new"
}
