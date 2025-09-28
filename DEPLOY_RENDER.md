# 🚀 Deploy no Render - Guia Completo

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Código commitado no repositório
- ✅ Conta no Render (gratuita)

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Verificar arquivos criados:
```bash
# Verificar se os arquivos foram criados
ls -la
# Deve ter: Dockerfile, render.yaml, backend/requirements-render.txt
```

### 1.2 Fazer commit das mudanças:
```bash
git add .
git commit -m "feat: adicionar configuração para Render"
git push origin main
```

## 🌐 Passo 2: Configurar no Render

### 2.1 Acessar Render:
1. Acesse: https://render.com
2. Clique em "Get Started for Free"
3. Faça login com GitHub

### 2.2 Criar Web Service:
1. Clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Selecione o repositório: `Sistema-de-gest-o-de-processos`

### 2.3 Configurar o Deploy:
```
Name: gestor-juridico
Environment: Docker
Dockerfile Path: ./Dockerfile
Branch: main
```

### 2.4 Variáveis de Ambiente:
```
ENVIRONMENT=production
SECRET_KEY=sua_chave_secreta_aqui_32_caracteres
ALLOWED_HOSTS=*
```

## 🗄️ Passo 3: Configurar Database

### 3.1 Criar PostgreSQL:
1. No Dashboard → "New +" → "PostgreSQL"
2. Nome: `gestor-juridico-db`
3. Database: `gestor_juridico`
4. User: `gestor_user`
5. **IMPORTANTE**: Copie a connection string!

### 3.2 Criar Redis:
1. No Dashboard → "New +" → "Redis"
2. Nome: `gestor-juridico-redis`
3. **IMPORTANTE**: Copie a connection string!

### 3.3 Adicionar variáveis no Web Service:
```
DATABASE_URL=<connection_string_do_postgresql>
REDIS_URL=<connection_string_do_redis>
```

## 🚀 Passo 4: Deploy

### 4.1 Iniciar Deploy:
1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos)
3. Verifique os logs

### 4.2 Verificar se funcionou:
- URL será: `https://gestor-juridico.onrender.com`
- Health check: `https://gestor-juridico.onrender.com/health`
- API docs: `https://gestor-juridico.onrender.com/docs`

## 🔧 Passo 5: Configurar Frontend (Opcional)

### 5.1 Deploy do Frontend:
1. "New +" → "Static Site"
2. Conecte o mesmo repositório
3. Build Command: `cd frontend && npm install && npm run build`
4. Publish Directory: `frontend/dist`

### 5.2 Variáveis do Frontend:
```
VITE_API_URL=https://gestor-juridico.onrender.com
VITE_APP_NAME=Gestor Jurídico
```

## 🎯 URLs Finais

- **Backend API**: `https://gestor-juridico.onrender.com`
- **Frontend**: `https://gestor-juridico-frontend.onrender.com`
- **API Docs**: `https://gestor-juridico.onrender.com/docs`
- **Health**: `https://gestor-juridico.onrender.com/health`

## 🛠️ Troubleshooting

### Erro de Build:
```bash
# Verificar logs no Render Dashboard
# Verificar se Dockerfile está correto
# Verificar se requirements.txt existe
```

### Erro de Database:
```bash
# Verificar se DATABASE_URL está correto
# Verificar se PostgreSQL está rodando
# Verificar se tabelas foram criadas
```

### Erro de Redis:
```bash
# Verificar se REDIS_URL está correto
# Verificar se Redis está rodando
# Verificar conexão
```

## 📊 Monitoramento

### Logs:
- Acesse o Dashboard do Render
- Clique no seu Web Service
- Aba "Logs" para ver logs em tempo real

### Métricas:
- CPU, RAM, Network
- Response time
- Error rate

## 💰 Custos

### Plano Gratuito:
- ✅ 750 horas/mês (suficiente para 24/7)
- ✅ 512MB RAM
- ✅ 1GB PostgreSQL
- ✅ 25MB Redis
- ✅ Sleep após 15min de inatividade

### Upgrade (se necessário):
- $7/mês para plano pago
- Sem sleep automático
- Mais recursos

## 🎉 Próximos Passos

1. **Testar todas as funcionalidades**
2. **Configurar domínio customizado** (opcional)
3. **Configurar CI/CD** (opcional)
4. **Monitorar performance**

---

**🚀 Seu sistema estará online em: https://gestor-juridico.onrender.com**
