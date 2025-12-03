# 🔑 Guia: Como Obter e Configurar a Chave do Hugging Face

## 📋 Passo a Passo para Obter o Token

### **Passo 1: Criar Conta no Hugging Face**

1. Acesse: https://huggingface.co/
2. Clique em **"Sign Up"** (canto superior direito)
3. Preencha o formulário ou use sua conta do Google/GitHub
4. Confirme seu email (verifique a caixa de entrada)

### **Passo 2: Obter o Token de Acesso**

1. Faça login na sua conta
2. Acesse: https://huggingface.co/settings/tokens
3. Clique em **"New token"**
4. Preencha:
   - **Name**: `Sistema Jurídico` (ou qualquer nome)
   - **Type**: Selecione **"Read"** (para usar a API Inference gratuita)
5. Clique em **"Generate token"**
6. **IMPORTANTE**: Copie o token imediatamente! Ele só aparece uma vez.
   - Formato: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Passo 3: Configurar no Projeto**

#### **Opção A: Usando arquivo .env (Recomendado)**

1. Copie o arquivo `env.example` para `.env`:
   ```bash
   cp env.example .env
   ```

2. Abra o arquivo `.env` e adicione/edite a linha:
   ```env
   HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Substitua `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` pelo seu token real

#### **Opção B: Variáveis de Ambiente do Sistema**

**Windows (PowerShell):**
```powershell
$env:HUGGINGFACE_API_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Windows (CMD):**
```cmd
set HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Linux/Mac:**
```bash
export HUGGINGFACE_API_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### **Passo 4: Verificar Configuração**

Após configurar, reinicie o servidor backend:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

## 🎯 Limites do Tier Gratuito

### **Hugging Face Inference API (Gratuito):**
- ✅ **30.000 requisições/mês** gratuitas
- ✅ Sem necessidade de cartão de crédito
- ✅ Acesso a todos os modelos públicos
- ✅ Sem limite de tempo

### **Modelos Disponíveis Gratuitamente:**
- `distilbert-base-uncased` - Análise de texto
- `google/flan-t5-base` - Geração de texto
- `facebook/bart-large-cnn` - Resumo de texto
- `distilbert-base-uncased-finetuned-sst-2-english` - Análise de sentimento

## ⚠️ Importante

1. **NÃO compartilhe seu token** publicamente
2. **NÃO commite o arquivo `.env`** no Git (já está no .gitignore)
3. O token é **pessoal e intransferível**
4. Se perder o token, gere um novo em: https://huggingface.co/settings/tokens

## 🔧 Configuração Alternativa (Sem Token)

Se você **NÃO quiser usar token** (funciona, mas com limites menores):

1. Deixe `HUGGINGFACE_API_TOKEN` vazio no `.env`:
   ```env
   HUGGINGFACE_API_TOKEN=
   ```

2. O sistema ainda funcionará, mas:
   - Pode ter rate limits mais restritivos
   - Alguns modelos podem não estar disponíveis
   - Requisições podem ser mais lentas

## 📝 Exemplo de Configuração Completa

```env
# ===========================================
# CONFIGURAÇÕES DE IA (HUGGING FACE)
# ===========================================

# Token da API Hugging Face
HUGGINGFACE_API_TOKEN=hf_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Usar API Inference (gratuito) ou modelo local
HUGGINGFACE_MODE=api

# Modelo padrão para análise
HUGGINGFACE_MODEL=distilbert-base-uncased

# Modelo para geração de texto (LLM)
HUGGINGFACE_LLM_MODEL=google/flan-t5-base

# Timeout para requisições (segundos)
AI_REQUEST_TIMEOUT=60

# Habilitar cache de respostas
AI_CACHE_ENABLED=true
```

## 🧪 Testar a Configuração

Após configurar, você pode testar:

1. **Via Swagger (Recomendado):**
   - Acesse: http://localhost:8000/docs
   - Vá em `/api/v1/ai/models`
   - Clique em "Try it out" → "Execute"
   - Deve retornar informações dos modelos

2. **Via Código Python:**
   ```python
   from app.services.ai_service import ai_service
   
   # Testar análise de texto
   result = await ai_service.analyze_text(
       text="Este é um texto de teste",
       task="sentiment-analysis"
   )
   print(result)
   ```

## 🆘 Problemas Comuns

### **Erro: "401 Unauthorized"**
- ✅ Verifique se o token está correto
- ✅ Certifique-se de que copiou o token completo (começa com `hf_`)

### **Erro: "503 Model is currently loading"**
- ✅ Normal! O modelo está carregando
- ✅ Aguarde alguns segundos e tente novamente
- ✅ O sistema já tem retry automático

### **Erro: "Rate limit exceeded"**
- ✅ Você atingiu o limite de 30k requisições/mês
- ✅ Aguarde o próximo mês ou considere upgrade

### **Token não funciona**
- ✅ Verifique se o token tem permissão "Read"
- ✅ Gere um novo token se necessário
- ✅ Certifique-se de que o `.env` está sendo carregado

## 📚 Links Úteis

- **Documentação Hugging Face:** https://huggingface.co/docs/api-inference/index
- **Gerenciar Tokens:** https://huggingface.co/settings/tokens
- **Modelos Disponíveis:** https://huggingface.co/models
- **Status da API:** https://status.huggingface.co/

## ✅ Checklist de Configuração

- [ ] Conta criada no Hugging Face
- [ ] Token gerado e copiado
- [ ] Arquivo `.env` criado
- [ ] Token adicionado no `.env`
- [ ] Servidor backend reiniciado
- [ ] Teste realizado via Swagger
- [ ] Funcionalidade de IA testada

---

**Pronto!** Agora você está configurado para usar a API do Hugging Face gratuitamente! 🎉

