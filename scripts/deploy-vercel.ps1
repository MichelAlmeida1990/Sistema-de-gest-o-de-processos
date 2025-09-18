# ===========================================
# SCRIPT DE DEPLOY PARA VERCEL (PowerShell)
# ===========================================

Write-Host "🚀 Deploy do Sistema de Gestão de Processos na Vercel" -ForegroundColor Blue
Write-Host "======================================================" -ForegroundColor Blue

# Verificar se está na raiz do projeto
if (-not (Test-Path "frontend\package.json")) {
    Write-Host "❌ Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Fase 1: Preparação
Write-Host "`n📋 Fase 1: Preparação" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

# Verificar Git
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Repositório Git não encontrado. Inicializando..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "feat: sistema pronto para deploy"
    Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
}

# Verificar mudanças
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Há mudanças não commitadas. Fazendo commit..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: preparar para deploy"
    Write-Host "✅ Mudanças commitadas" -ForegroundColor Green
}

# Fase 2: Build do Frontend
Write-Host "`n🏗️ Fase 2: Build do frontend" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

Set-Location frontend

# Verificar dependências
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm install
}

# Fazer build
Write-Host "🔨 Fazendo build para produção..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Verificar tamanho do build
$buildSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Tamanho do build: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan

Set-Location ..

# Fase 3: Instruções
Write-Host "`n📋 Instruções de Deploy" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

Write-Host "`n🎯 FRONTEND (Vercel):" -ForegroundColor Green
Write-Host "1. Acesse: https://vercel.com"
Write-Host "2. New Project → Import Git Repository"
Write-Host "3. Selecione seu repositório"
Write-Host "4. Configure:"
Write-Host "   - Framework: Vite"
Write-Host "   - Root Directory: frontend"
Write-Host "   - Build Command: npm run build"
Write-Host "   - Output Directory: dist"
Write-Host "5. Variáveis de ambiente:"
Write-Host "   VITE_API_URL = https://seu-backend.railway.app/api/v1"
Write-Host "   VITE_DEBUG = false"

Write-Host "`n🎯 BACKEND (Railway):" -ForegroundColor Green
Write-Host "1. Acesse: https://railway.app"
Write-Host "2. New Project → Deploy from GitHub"
Write-Host "3. Root Directory: backend"
Write-Host "4. Adicione PostgreSQL e Redis"
Write-Host "5. Configure variáveis (ver .env.production.keys)"

Write-Host "`n🔐 CHAVES DE SEGURANÇA:" -ForegroundColor Yellow
if (Test-Path ".env.production.keys") {
    Write-Host "✅ Chaves geradas em: .env.production.keys"
    Write-Host "📋 Use essas chaves no Railway"
} else {
    Write-Host "⚠️  Gerando chaves de segurança..."
    Set-Location scripts
    python generate-keys.py
    Set-Location ..
    Write-Host "✅ Chaves geradas!"
}

Write-Host "`n📚 DOCUMENTAÇÃO:" -ForegroundColor Cyan
Write-Host "📖 Guia completo: DEPLOY_VERCEL.md"
Write-Host "📖 Documentação: README.md"

Write-Host "`n🎉 Sistema pronto para deploy!" -ForegroundColor Green
Write-Host "🚀 Siga as instruções acima para deploy completo" -ForegroundColor Green

# Perguntar se quer abrir URLs
$openUrls = Read-Host "`n🌐 Quer abrir Vercel e Railway no navegador? (y/N)"
if ($openUrls -eq "y" -or $openUrls -eq "Y") {
    Start-Process "https://vercel.com/new"
    Start-Process "https://railway.app/new"
    Write-Host "✅ URLs abertas no navegador" -ForegroundColor Green
}
