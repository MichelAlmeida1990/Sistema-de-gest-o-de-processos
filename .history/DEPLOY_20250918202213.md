# 🚀 Guia de Deploy - Sistema de Gestão de Processos

Este guia detalha como fazer deploy do sistema em produção usando Vercel (frontend) + Railway/Heroku (backend).

## 📋 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Conta na [Railway](https://railway.app) ou [Heroku](https://heroku.com)
- ✅ Repositório Git (GitHub/GitLab)
- ✅ Node.js 18+ instalado
- ✅ Vercel CLI instalado: `npm install -g vercel`

## 🎯 Arquitetura de Deploy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Banco de      │
│   (Vercel)      │◄──►│ (Railway/Heroku)│◄──►│   Dados         │
│   React + Vite  │    │   FastAPI       │    │ (PostgreSQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Fase 1: Preparação

### 1. **Configurar Repositório Git**

```bash
# Se ainda não tem repositório
git init
git add .
git commit -m "feat: sistema completo pronto para deploy"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 2. **Preparar Variáveis de Ambiente**

Crie um arquivo `.env.production` com:

```env
# ===========================================
# PRODUÇÃO - BACKEND
# ===========================================

ENVIRONMENT=production
DEBUG=false

# Segurança (GERAR NOVAS CHAVES!)
SECRET_KEY=sua-chave-super-secreta-de-32-caracteres-ou-mais
ENCRYPTION_KEY=sua-chave-de-criptografia-32-chars

# URLs (ajustar após deploy)
FRONTEND_URL=https://seu-app.vercel.app
BACKEND_URL=https://seu-backend.railway.app

# Banco de dados (Railway/Heroku fornece)
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis (Railway/Heroku fornece)
REDIS_URL=redis://user:pass@host:port

# Email (configurar com Gmail ou SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password
FROM_EMAIL=noreply@seudominio.com

# API DataJud (opcional)
DATAJUD_API_TOKEN=seu-token-cnj

# Rate limiting (ajustar para produção)
RATE_LIMIT_PER_MINUTE=120
RATE_LIMIT_PER_HOUR=5000
```

## 🚀 Fase 2: Deploy do Backend

### **Opção A: Railway (Recomendado)**

1. **Acesse**: https://railway.app
2. **Conecte seu GitHub**
3. **Crie novo projeto** → "Deploy from GitHub repo"
4. **Selecione** seu repositório
5. **Configure** variáveis de ambiente:
   ```
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=sua-chave-secreta
   FRONTEND_URL=https://seu-app.vercel.app
   ```
6. **Railway detecta** automaticamente o `railway.toml`
7. **Deploy automático** será feito

### **Opção B: Heroku**

```bash
# Instalar Heroku CLI
# Fazer login
heroku login

# Criar aplicação
heroku create seu-app-backend

# Configurar variáveis
heroku config:set ENVIRONMENT=production
heroku config:set DEBUG=false
heroku config:set SECRET_KEY=sua-chave-secreta

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Adicionar Redis
heroku addons:create heroku-redis:mini

# Deploy
git subtree push --prefix=backend heroku main
```

## 🌐 Fase 3: Deploy do Frontend

### 1. **Preparar Frontend**

```bash
cd frontend

# Instalar dependências
npm install

# Testar build
npm run build
```

### 2. **Deploy na Vercel**

```bash
# Fazer login na Vercel
vercel login

# Deploy
vercel --prod

# Ou usar o script automatizado
cd ..
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

### 3. **Configurar Variáveis na Vercel**

No painel da Vercel:
1. **Vá em Settings** → Environment Variables
2. **Adicione**:
   ```
   VITE_API_URL = https://seu-backend.railway.app/api/v1
   VITE_WS_URL = wss://seu-backend.railway.app/api/v1/ws
   VITE_DEBUG = false
   VITE_APP_ENV = production
   ```
3. **Redeploy** o projeto

## 🔧 Fase 4: Configurações Finais

### 1. **Configurar CORS no Backend**

No Railway/Heroku, adicionar:
```env
ALLOWED_HOSTS=["https://seu-app.vercel.app"]
```

### 2. **Configurar Domínio (Opcional)**

#### **Vercel:**
- Settings → Domains → Add Domain
- Configurar DNS: CNAME → seu-app.vercel.app

#### **Railway:**
- Settings → Domains → Custom Domain
- Configurar DNS: CNAME → seu-backend.railway.app

### 3. **Configurar SSL/HTTPS**

✅ **Vercel**: SSL automático  
✅ **Railway**: SSL automático  
✅ **Heroku**: SSL automático  

## 📊 Fase 5: Monitoramento

### 1. **Configurar Sentry (Opcional)**

```bash
# Criar conta no Sentry.io
# Adicionar DSN nas variáveis:
SENTRY_DSN=https://sua-dsn@sentry.io
```

### 2. **Configurar Logs**

```bash
# Railway/Heroku têm logs automáticos
# Acessar via CLI:
railway logs  # Railway
heroku logs --tail  # Heroku
```

## ✅ Checklist de Deploy

### **🔥 Crítico**
- [ ] **Repositório Git** configurado
- [ ] **SECRET_KEY** gerada (32+ chars)
- [ ] **DEBUG=false** em produção
- [ ] **ALLOWED_HOSTS** configurado
- [ ] **Backend deployado** (Railway/Heroku)
- [ ] **Frontend deployado** (Vercel)
- [ ] **Variáveis de ambiente** configuradas
- [ ] **CORS** configurado entre frontend/backend

### **⚡ Importante**
- [ ] **Banco PostgreSQL** em produção
- [ ] **Redis** em produção
- [ ] **Email SMTP** configurado
- [ ] **Domínio personalizado**
- [ ] **SSL/HTTPS** ativo
- [ ] **Logs** funcionando

### **💡 Opcional**
- [ ] **Sentry** para monitoramento
- [ ] **CDN** para assets
- [ ] **Backup automático**
- [ ] **Monitoring/Uptime**

## 🎯 URLs Finais

Após deploy completo:

- **Frontend**: https://seu-app.vercel.app
- **Backend**: https://seu-backend.railway.app
- **API Docs**: https://seu-backend.railway.app/docs
- **Admin**: https://seu-app.vercel.app/admin

## 🔐 Credenciais de Produção

**Criar usuário admin em produção:**

```python
# Executar no Railway/Heroku
python -c "
from app.core.database import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.services.auth import AuthService
from datetime import datetime

db = SessionLocal()
hashed_password = AuthService.get_password_hash('SuaSenhaSegura123!')

admin = User(
    email='admin@seudominio.com',
    username='admin',
    full_name='Administrador',
    hashed_password=hashed_password,
    role=UserRole.ADMIN,
    status=UserStatus.ACTIVE,
    is_active=True,
    is_verified=True
)

db.add(admin)
db.commit()
print('Admin criado: admin@seudominio.com')
"
```

## 🆘 Troubleshooting

### **Problemas Comuns:**

1. **CORS Error**
   ```bash
   # Verificar ALLOWED_HOSTS no backend
   ALLOWED_HOSTS=["https://seu-app.vercel.app"]
   ```

2. **API não conecta**
   ```bash
   # Verificar VITE_API_URL no frontend
   VITE_API_URL=https://seu-backend.railway.app/api/v1
   ```

3. **Build falha**
   ```bash
   # Limpar cache e reinstalar
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## 🎉 Resultado Final

Após seguir este guia, você terá:

- ✅ **Frontend** rodando na Vercel
- ✅ **Backend** rodando no Railway/Heroku
- ✅ **Banco PostgreSQL** em produção
- ✅ **Redis** para cache
- ✅ **HTTPS** configurado
- ✅ **Domínio** personalizado (opcional)
- ✅ **Sistema completo** em produção

**🚀 Sistema pronto para uso em produção!**
