# 🧪 Guia de Teste da API

## ✅ Status da API

**API está funcionando corretamente!**

- **URL Base:** `http://localhost:8000`
- **API v1:** `http://localhost:8000/api/v1`
- **Status:** ✅ Healthy
- **Banco de Dados:** ✅ Conectado
- **Redis:** ✅ Conectado

---

## 🚀 Como Testar

### 1. **Teste Básico - Health Check**

```bash
curl http://localhost:8000/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": 1763321859.133234
}
```

---

### 2. **Teste de Login**

**Endpoint:** `POST /api/v1/auth/login`

**Comando cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sistema.com\",\"password\":\"123456\"}"
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@sistema.com",
    "username": "admin",
    "full_name": "Administrador",
    "role": "admin"
  }
}
```

**Teste com Demo:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@demo.com\",\"password\":\"demo123\"}"
```

---

### 3. **Teste de Endpoints Protegidos**

Primeiro, faça login e copie o `access_token`:

```bash
# 1. Login e salvar token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"123456"}' | jq -r '.access_token')

# 2. Usar token para acessar endpoint protegido
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. **Teste de Índices Econômicos**

**Listar índices disponíveis:**
```bash
curl http://localhost:8000/api/v1/indices-economicos/disponiveis
```

**Consultar IPCA-E:**
```bash
curl "http://localhost:8000/api/v1/indices-economicos/IPCA_E?data_fim=01/12/2024"
```

**Calcular atualização:**
```bash
curl -X POST http://localhost:8000/api/v1/indices-economicos/calcular-atualizacao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "valor_origem": 100000,
    "data_base": "01/01/2020",
    "indice": "IPCA_E"
  }'
```

---

### 5. **Teste de Precatórios**

**Listar precatórios:**
```bash
curl http://localhost:8000/api/v1/precatorios \
  -H "Authorization: Bearer $TOKEN"
```

**Criar precatório:**
```bash
curl -X POST http://localhost:8000/api/v1/precatorios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numero": "PREC-001",
    "ente_devedor": "União",
    "cliente_nome": "João Silva",
    "valor_origem": 50000,
    "natureza": "alimentar",
    "status": "aguardando_inscricao",
    "data_inscricao": "2024-01-15T00:00:00Z"
  }'
```

**Calcular atualização de precatório:**
```bash
curl -X POST "http://localhost:8000/api/v1/precatorios/1/calcular-atualizacao?indice=IPCA_E" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. **Documentação Interativa (Swagger)**

Acesse no navegador:
```
http://localhost:8000/docs
```

Ou a documentação alternativa:
```
http://localhost:8000/redoc
```

Aqui você pode:
- Ver todos os endpoints disponíveis
- Testar diretamente no navegador
- Ver exemplos de requisições e respostas
- Testar autenticação

---

## 🧪 Teste Completo com PowerShell

Crie um arquivo `test-api.ps1`:

```powershell
# Teste completo da API
Write-Host "🧪 Testando API..." -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8000/health"
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host "Database: $($health.database)" -ForegroundColor Green
Write-Host "Redis: $($health.redis)" -ForegroundColor Green

# 2. Login
Write-Host "`n2. Testando Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@sistema.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.access_token
Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

# 3. Obter usuário atual
Write-Host "`n3. Obtendo dados do usuário..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

$user = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/me" `
    -Headers $headers

Write-Host "✅ Usuário: $($user.email)" -ForegroundColor Green
Write-Host "Nome: $($user.full_name)" -ForegroundColor Green
Write-Host "Role: $($user.role)" -ForegroundColor Green

# 4. Listar índices disponíveis
Write-Host "`n4. Listando índices econômicos..." -ForegroundColor Yellow
$indices = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/indices-economicos/disponiveis" `
    -Headers $headers

Write-Host "✅ Índices disponíveis: $($indices.total)" -ForegroundColor Green
foreach ($indice in $indices.indices) {
    Write-Host "  - $($indice.codigo): $($indice.nome)" -ForegroundColor Gray
}

Write-Host "`n✅ Todos os testes passaram!" -ForegroundColor Green
```

Execute:
```powershell
.\test-api.ps1
```

---

## 📋 Credenciais de Teste

### Admin
- **Email:** `admin@sistema.com`
- **Senha:** `123456`
- **Role:** Admin

### Demo
- **Email:** `demo@demo.com`
- **Senha:** `demo123`
- **Role:** Assistant

---

## 🔍 Verificar Logs

Para ver os logs do backend em tempo real:

```bash
docker logs -f gestao_processos_backend
```

---

## ✅ Checklist de Testes

- [ ] Health check retorna `healthy`
- [ ] Login com admin funciona
- [ ] Login com demo funciona
- [ ] Endpoints protegidos requerem token
- [ ] Listar índices econômicos funciona
- [ ] Calcular atualização funciona
- [ ] CRUD de precatórios funciona
- [ ] Documentação Swagger acessível

---

## 🐛 Problemas Comuns

### Erro 401 (Unauthorized)
- Verifique se o token está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se o token não expirou (30 minutos por padrão)

### Erro 500 (Internal Server Error)
- Verifique os logs: `docker logs gestao_processos_backend`
- Verifique se o banco de dados está conectado

### Erro de CORS
- Certifique-se de que está usando `http://localhost:8000` (não o Render)
- Verifique se o frontend está configurado corretamente

---

## 📚 Endpoints Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Status da API |
| `/api/v1/auth/login` | POST | Login |
| `/api/v1/users/me` | GET | Dados do usuário atual |
| `/api/v1/indices-economicos/disponiveis` | GET | Listar índices |
| `/api/v1/precatorios` | GET/POST | Listar/Criar precatórios |
| `/docs` | GET | Documentação Swagger |

---

**🎉 API está funcionando perfeitamente!**

