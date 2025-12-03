# Deploy no Netlify - Instruções

## Configuração do Netlify

### 1. Configurações de Build no Netlify

No painel do Netlify, configure:

**Build settings:**
- **Base directory**: `frontend`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `frontend/dist`

### 2. Variáveis de Ambiente

No painel do Netlify, adicione as seguintes variáveis de ambiente:

```
VITE_API_URL=https://seu-backend.herokuapp.com/api/v1
VITE_API_BASE_URL=https://seu-backend.herokuapp.com/api/v1
VITE_APP_NAME=Sistema de Gestão de Processos
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_FRONTEND_URL=https://seu-site.netlify.app
VITE_WS_URL=wss://seu-backend.herokuapp.com
VITE_ENABLE_2FA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_REPORTS=true
VITE_ENABLE_TIMELINE=true
VITE_ENABLE_WEBSOCKET=true
```

### 3. Deploy Manual

Se o deploy automático não funcionar, você pode fazer deploy manual:

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Build do projeto
npm run build

# 3. Fazer upload da pasta dist/ para o Netlify
```

### 4. Problemas Comuns

**Erro de build:**
- Verifique se o Node.js está na versão 18+
- Verifique se todas as dependências estão instaladas

**Erro de CORS:**
- Configure o backend para aceitar requests do domínio do Netlify
- Adicione o domínio do Netlify nas configurações de CORS do backend

**Erro 404 em rotas:**
- O arquivo `netlify.toml` já está configurado com redirects para SPA

### 5. URLs de Exemplo

Substitua pelos seus URLs reais:
- Frontend: `https://seu-site.netlify.app`
- Backend: `https://seu-backend.herokuapp.com`

## Comandos Úteis

```bash
# Build local para testar
cd frontend
npm run build

# Preview do build
npm run preview

# Verificar se o build está funcionando
cd dist
python -m http.server 8000
```
