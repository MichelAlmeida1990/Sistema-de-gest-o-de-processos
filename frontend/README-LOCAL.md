# 🚀 Configuração para Desenvolvimento Local

## Problema de CORS ao testar localmente

Se você está testando o frontend localmente e recebendo erros de CORS ao tentar acessar o backend no Render, você precisa configurar o frontend para usar o backend local.

## Solução Rápida

### Opção 1: Usar script PowerShell (Windows)

```powershell
# Execute o script de configuração
.\setup-local-env.ps1

# Depois execute o frontend
npm run dev
```

### Opção 2: Configurar manualmente no terminal

**PowerShell:**
```powershell
$env:VITE_API_URL="http://localhost:8000/api/v1"
npm run dev
```

**Bash/Linux/Mac:**
```bash
export VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

### Opção 3: Criar arquivo .env.local (Recomendado)

Crie um arquivo `frontend/.env.local` com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_ENV=development
VITE_DEBUG=true
```

Depois reinicie o servidor Vite (`npm run dev`).

## ⚠️ Importante

1. **Backend local deve estar rodando** em `http://localhost:8000`
2. **Reinicie o servidor Vite** após criar/modificar o `.env.local`
3. O arquivo `.env.local` é ignorado pelo Git (não será commitado)

## Verificar configuração

Para verificar qual URL está sendo usada, abra o console do navegador e verifique:
- O arquivo `config/env.ts` mostra a URL padrão: `http://localhost:8000/api/v1`
- Se houver uma variável de ambiente configurada, ela terá prioridade

## Backend Local

Para rodar o backend localmente:

```bash
cd backend
uvicorn app.main:app --reload
```

Ou usando Docker Compose:

```bash
docker-compose up -d
```




