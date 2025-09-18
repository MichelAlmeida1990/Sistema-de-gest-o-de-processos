# 🚀 Deploy no Render.com - GRATUITO

## 📋 Pré-requisitos
- Conta no [Render.com](https://render.com)
- Projeto no GitHub (✅ já feito!)

## 🎯 Passo a Passo

### 1️⃣ **Criar Conta no Render**
1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Faça login com **GitHub**

### 2️⃣ **Deploy do Backend**

#### **A. Criar Web Service**
1. No dashboard do Render, clique **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório: `Sistema-de-gest-o-de-processos`

#### **B. Configurações do Serviço**
```
Name: sistema-processos-api
Environment: Python 3
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### **C. Variáveis de Ambiente**
```
DATABASE_URL: (será gerada automaticamente)
SECRET_KEY: sua-chave-secreta-aqui
ENCRYPTION_KEY: sua-chave-encriptacao-aqui
ENVIRONMENT: production
DEBUG: false
CORS_ORIGINS: https://seu-frontend.vercel.app
```

### 3️⃣ **Criar Banco PostgreSQL**
1. No dashboard, clique **"New +"**
2. Selecione **"PostgreSQL"**
3. Configure:
   ```
   Name: sistema-processos-db
   Database Name: sistema_processos
   User: postgres
   ```

### 4️⃣ **Criar Redis**
1. No dashboard, clique **"New +"**
2. Selecione **"Redis"**
3. Configure:
   ```
   Name: sistema-processos-redis
   ```

### 5️⃣ **Conectar Serviços**
1. Vá no seu **Web Service**
2. Em **Environment**, adicione:
   ```
   DATABASE_URL: [URL do PostgreSQL]
   REDIS_URL: [URL do Redis]
   ```

## 🔧 **URLs Geradas**

Após o deploy, você terá:
- **API**: `https://sistema-processos-api.onrender.com`
- **Health Check**: `https://sistema-processos-api.onrender.com/health`
- **Docs**: `https://sistema-processos-api.onrender.com/docs`

## ⚡ **Para o Frontend (Vercel)**

Use essas variáveis no Vercel:
```
VITE_API_URL=https://sistema-processos-api.onrender.com/api/v1
VITE_WS_URL=wss://sistema-processos-api.onrender.com
VITE_APP_ENV=production
```

## 🎉 **Vantagens do Render**
- ✅ **100% Gratuito** para projetos pequenos
- ✅ **PostgreSQL incluído**
- ✅ **SSL automático**
- ✅ **Deploy automático** do GitHub
- ✅ **Zero configuração** de servidor

## 🔄 **Deploy Automático**
Cada push para `main` fará deploy automático! 🚀

## ⚠️ **Limitações do Plano Gratuito**
- **Sleep após 15min** de inatividade
- **750h/mês** de uptime
- **Primeira requisição** pode ser lenta (cold start)

---

**Pronto! Seu backend estará rodando gratuitamente no Render! 🎉**
