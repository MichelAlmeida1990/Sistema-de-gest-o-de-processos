# 🧪 Como Testar o Sistema - Guia Completo

Este documento explica como verificar se todas as funcionalidades do sistema estão funcionando corretamente.

## 📋 Scripts de Teste Disponíveis

### 1. Script Python Completo (Recomendado)

**Arquivo:** `backend/test_all_features.py`

**Como executar:**
```bash
cd backend
python test_all_features.py
```

**O que testa:**
- ✅ Health Check (banco de dados e Redis)
- ✅ Autenticação (login)
- ✅ Dashboard (estatísticas e atividades recentes)
- ✅ Processos (listar e criar)
- ✅ Tarefas
- ✅ Usuários
- ✅ Jurisprudência (incluindo chat)
- ✅ Diagnóstico Jurídico
- ✅ Precatórios
- ✅ Notificações
- ✅ Timeline
- ✅ Relatórios
- ✅ Índices Econômicos
- ✅ Cálculo de Prazos

### 2. Script PowerShell (Windows)

**Arquivo:** `test-system.ps1`

**Como executar:**
```powershell
.\test-system.ps1
```

**O que testa:**
- Testes básicos de conectividade
- Autenticação
- Endpoints principais

### 3. Script Python Simplificado

**Arquivo:** `testar-sistema.py`

**Como executar:**
```bash
python testar-sistema.py
```

## 🔍 Testes Manuais

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "...",
  "version": "1.0.0"
}
```

### 2. Teste de Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"123456"}'
```

**Resposta esperada:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 3. Teste de Endpoints com Autenticação

Após obter o token, teste os endpoints:

```bash
# Dashboard
curl http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Processos
curl http://localhost:8000/api/v1/processes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Tarefas
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Checklist de Funcionalidades

### ✅ Funcionalidades Básicas
- [ ] Health Check funcionando
- [ ] Login/Autenticação funcionando
- [ ] Dashboard carregando dados
- [ ] Processos (listar, criar, editar, deletar)
- [ ] Tarefas (listar, criar, atualizar)
- [ ] Usuários (listar, criar, editar)

### ✅ Funcionalidades Jurídicas
- [ ] Assistente de Jurisprudência
  - [ ] Análise de jurisprudência
  - [ ] Comparação de casos
  - [ ] Chat com IA
- [ ] Diagnóstico Jurídico
- [ ] Precatórios
- [ ] Cálculo de Prazos Processuais

### ✅ Funcionalidades Adicionais
- [ ] Notificações
- [ ] Timeline de eventos
- [ ] Relatórios
- [ ] Upload de arquivos
- [ ] Índices Econômicos
- [ ] Integração DataJud (CNJ)
- [ ] Financeiro

## 🐛 Solução de Problemas

### Erro: "Token inválido"
- Verifique se o token foi copiado corretamente
- Verifique se o token não expirou (tokens expiram em 30 minutos)
- Faça login novamente para obter um novo token

### Erro: "Connection refused"
- Verifique se o backend está rodando: `docker ps`
- Verifique se a porta 8000 está acessível
- Reinicie o backend: `docker restart gestao_processos_backend`

### Erro: "Database not connected"
- Verifique se o PostgreSQL está rodando: `docker ps | grep postgres`
- Verifique os logs: `docker logs gestao_processos_db`

### Erro: "Redis not connected"
- Verifique se o Redis está rodando: `docker ps | grep redis`
- Verifique os logs: `docker logs gestao_processos_redis`

## 📝 Interpretando os Resultados

### ✅ Teste Passou
- Endpoint respondeu com status 200
- Dados foram retornados corretamente
- Sem erros no log

### ❌ Teste Falhou
- Status diferente de 200 (401 = não autenticado, 404 = não encontrado, 500 = erro interno)
- Erro na resposta
- Timeout na requisição

## 🔄 Executar Testes Automaticamente

### Via Docker (Recomendado)

```bash
# Executar todos os testes
docker exec -it gestao_processos_backend python test_all_features.py
```

### Via Script de Automação

Crie um arquivo `run-tests.sh` (Linux/Mac) ou `run-tests.ps1` (Windows):

```bash
#!/bin/bash
echo "Executando testes do sistema..."
python backend/test_all_features.py
```

## 📈 Monitoramento Contínuo

Para monitorar o sistema continuamente, você pode:

1. **Executar testes periodicamente:**
   ```bash
   # A cada 5 minutos
   watch -n 300 python backend/test_all_features.py
   ```

2. **Integrar com CI/CD:**
   - Adicione os testes ao pipeline de CI/CD
   - Execute antes de cada deploy

3. **Alertas:**
   - Configure alertas para quando testes falharem
   - Monitore os logs do sistema

## 🎯 Próximos Passos

1. Execute o script de teste completo
2. Verifique quais funcionalidades estão falhando
3. Corrija os problemas identificados
4. Execute novamente para validar as correções

---

**Última atualização:** 2025-12-03
**Versão do sistema:** 1.0.0

