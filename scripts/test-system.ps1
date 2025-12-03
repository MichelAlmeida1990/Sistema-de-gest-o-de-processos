# Script de Teste do Sistema - PowerShell
# Testa todas as funcionalidades principais do sistema

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTE COMPLETO DO SISTEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"
$apiBase = "$baseUrl/api/v1"
$testUser = @{
    email = "admin@sistema.com"
    password = "123456"
}

$results = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $results.Total++
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  [OK] $Name" -ForegroundColor Green
            $results.Passed++
            return $true
        } else {
            Write-Host "  [ERRO] $Name - Status: $($response.StatusCode)" -ForegroundColor Red
            $results.Failed++
            return $false
        }
    } catch {
        Write-Host "  [ERRO] $Name - $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed++
        return $false
    }
}

# 1. Health Check
Write-Host "`n1. TESTE DE HEALTH CHECK" -ForegroundColor Yellow
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/health"

# 2. Autenticação
Write-Host "`n2. TESTE DE AUTENTICAÇÃO" -ForegroundColor Yellow
$loginResponse = Test-Endpoint -Name "Login" -Method "POST" -Url "$apiBase/auth/login" -Body $testUser

$token = $null
if ($loginResponse) {
    try {
        $response = Invoke-WebRequest -Uri "$apiBase/auth/login" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        $token = $data.access_token
        Write-Host "  [OK] Token obtido com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "  [ERRO] Falha ao obter token" -ForegroundColor Red
    }
}

$headers = @{}
if ($token) {
    $headers["Authorization"] = "Bearer $token"
}

# 3. Dashboard
Write-Host "`n3. TESTE DE DASHBOARD" -ForegroundColor Yellow
Test-Endpoint -Name "Dashboard Stats" -Method "GET" -Url "$apiBase/dashboard/stats" -Headers $headers
Test-Endpoint -Name "Dashboard Recent Activity" -Method "GET" -Url "$apiBase/dashboard/recent-activity" -Headers $headers

# 4. Processos
Write-Host "`n4. TESTE DE PROCESSOS" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Processos" -Method "GET" -Url "$apiBase/processes" -Headers $headers

# 5. Tarefas
Write-Host "`n5. TESTE DE TAREFAS" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Tarefas" -Method "GET" -Url "$apiBase/tasks" -Headers $headers

# 6. Usuários
Write-Host "`n6. TESTE DE USUÁRIOS" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Usuários" -Method "GET" -Url "$apiBase/users" -Headers $headers
Test-Endpoint -Name "Perfil do Usuário" -Method "GET" -Url "$apiBase/users/me" -Headers $headers

# 7. Jurisprudência
Write-Host "`n7. TESTE DE JURISPRUDÊNCIA" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Jurisprudências" -Method "GET" -Url "$apiBase/jurisprudence/" -Headers $headers

# 8. Diagnóstico Jurídico
Write-Host "`n8. TESTE DE DIAGNÓSTICO JURÍDICO" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Diagnósticos" -Method "GET" -Url "$apiBase/legal-diagnosis/" -Headers $headers

# 9. Precatórios
Write-Host "`n9. TESTE DE PRECATÓRIOS" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Precatórios" -Method "GET" -Url "$apiBase/precatorios/" -Headers $headers

# 10. Notificações
Write-Host "`n10. TESTE DE NOTIFICAÇÕES" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Notificações" -Method "GET" -Url "$apiBase/notifications/" -Headers $headers

# 11. Timeline
Write-Host "`n11. TESTE DE TIMELINE" -ForegroundColor Yellow
Test-Endpoint -Name "Listar Timeline" -Method "GET" -Url "$apiBase/timeline/" -Headers $headers

# 12. Relatórios
Write-Host "`n12. TESTE DE RELATÓRIOS" -ForegroundColor Yellow
Test-Endpoint -Name "Relatórios Dashboard" -Method "GET" -Url "$apiBase/reports/dashboard" -Headers $headers

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Total de Testes: $($results.Total)" -ForegroundColor White
Write-Host "Passou: $($results.Passed)" -ForegroundColor Green
Write-Host "Falhou: $($results.Failed)" -ForegroundColor Red

$percentage = if ($results.Total -gt 0) { [math]::Round(($results.Passed / $results.Total) * 100, 1) } else { 0 }
Write-Host "`nTaxa de Sucesso: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 80) { "Yellow" } else { "Red" })

if ($results.Failed -eq 0) {
    Write-Host "`n✓ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Alguns testes falharam. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host "`n"

