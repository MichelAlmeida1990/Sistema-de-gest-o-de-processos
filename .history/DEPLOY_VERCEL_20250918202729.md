# 🚀 Deploy Rápido na Vercel - Guia Prático

## ⚡ Deploy em 5 Minutos

### 1. **Preparar Repositório**
```bash
# Se ainda não tem repositório no GitHub
git init
git add .
git commit -m "feat: sistema pronto para deploy"

# Criar repo no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### 2. **Deploy do Frontend na Vercel**

#### **Opção A: Interface Web (Mais Fácil)**
1. Acesse: https://vercel.com
2. Clique em **"New Project"**
3. **Conecte** seu repositório GitHub
4. **Configure**:
   - Framework: **Vite**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **dist**
5. **Adicione** variáveis de ambiente:
   ```
   VITE_API_URL = http://localhost:8000/api/v1
   VITE_DEBUG = false
   ```
6. Clique em **"Deploy"**

#### **Opção B: CLI (Mais Rápido)**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy (no diretório frontend)
cd frontend
vercel --prod

# Seguir prompts:
# - Set up and deploy? Y
# - Which scope? Sua conta
# - Link to existing project? N
# - Project name: sistema-gestao-processos
# - Directory: ./
# - Override settings? N
```

### 3. **Configurar Variáveis de Ambiente**

No painel da Vercel ou via CLI:

```bash
# Via CLI
vercel env add VITE_API_URL production
# Digite: https://SEU_BACKEND.railway.app/api/v1

vercel env add VITE_DEBUG production  
# Digite: false

# Redeploy
vercel --prod
```

### 4. **Deploy do Backend (Railway - Recomendado)**

1. **Acesse**: https://railway.app
2. **Login** com GitHub
3. **New Project** → Deploy from GitHub repo
4. **Selecione** seu repositório
5. **Configure** Root Directory: **backend**
6. **Adicione** variáveis de ambiente:
   ```
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=^moXJ!Bs2O^C5UcPy!ATooY46lJ^%fG9pr*nbfvK7xBvIe66br8*uHesGCBNBE8G
   ENCRYPTION_KEY=i_RY1WLvwjJboDSyGFsqda5t_TlQER0CjbM7qv9D-5E=
   FRONTEND_URL=https://SEU_APP.vercel.app
   ALLOWED_HOSTS=["https://SEU_APP.vercel.app"]
   ```
7. **Railway** detecta automaticamente e faz deploy

### 5. **Conectar Frontend e Backend**

1. **Copie** a URL do backend do Railway
2. **Atualize** variável na Vercel:
   ```
   VITE_API_URL = https://SEU_BACKEND.railway.app/api/v1
   ```
3. **Redeploy** na Vercel

## ✅ Checklist de Deploy

### **Frontend (Vercel)**
- [ ] Repositório no GitHub
- [ ] Build funcionando (`npm run build`)
- [ ] Deploy na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] URL funcionando

### **Backend (Railway)**
- [ ] Deploy no Railway
- [ ] PostgreSQL adicionado
- [ ] Redis adicionado  
- [ ] Variáveis de ambiente configuradas
- [ ] Health check funcionando

### **Integração**
- [ ] CORS configurado no backend
- [ ] URLs atualizadas no frontend
- [ ] Login funcionando
- [ ] APIs conectadas

## 🎯 URLs Finais

Após deploy completo:

- **Frontend**: https://sistema-gestao-processos.vercel.app
- **Backend**: https://sistema-gestao-processos.railway.app
- **API Docs**: https://sistema-gestao-processos.railway.app/docs

## 🔐 Credenciais de Produção

**Usuário Admin:**
- Email: admin@sistema.com
- Senha: 123456

## 🆘 Troubleshooting

### **Build falha na Vercel:**
```bash
# Configurar Node.js version
# No painel Vercel: Settings → Environment Variables
NODE_VERSION = 18
```

### **API não conecta:**
```bash
# Verificar CORS no backend
ALLOWED_HOSTS=["https://seu-app.vercel.app"]

# Verificar URL no frontend
VITE_API_URL=https://seu-backend.railway.app/api/v1
```

### **WebSocket falha:**
```bash
# Desabilitar WebSocket temporariamente
VITE_ENABLE_WEBSOCKET=false
```

## 🎉 Resultado

Sistema completo em produção:
- ✅ Interface moderna na Vercel
- ✅ API robusta no Railway  
- ✅ Banco PostgreSQL
- ✅ Cache Redis
- ✅ HTTPS automático
- ✅ Deploy contínuo

**🚀 Sistema pronto para uso em produção!**
