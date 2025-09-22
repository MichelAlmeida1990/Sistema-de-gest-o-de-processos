# 🚀 Deploy no PythonAnywhere

## 📋 Passo a Passo Completo

### **1. Criar Conta no PythonAnywhere**
- Acesse: https://www.pythonanywhere.com
- Clique em "Sign up for a free account"
- Crie sua conta gratuita

### **2. Configurar o Projeto**

#### **No Console do PythonAnywhere:**

```bash
# Clone o repositório
git clone https://github.com/MichelAlmeida1990/Sistema-de-gest-o-de-processos.git gestor-juridico

# Entre no diretório
cd gestor-juridico

# Instale as dependências
pip3.10 install --user -r pythonanywhere_requirements.txt

# Teste se funciona
python3.10 pythonanywhere_start.py
```

### **3. Configurar Web App**

#### **No Dashboard do PythonAnywhere:**

1. **Vá em "Web"** → **"Add a new web app"**
2. **Escolha** "Manual configuration"
3. **Python version**: 3.10
4. **Source code**: `/home/seuusuario/gestor-juridico`
5. **WSGI file**: `/home/seuusuario/gestor-juridico/pythonanywhere_wsgi.py`

### **4. Configurar Domínio**

#### **No Web App Settings:**
- **Domain**: `seuusuario.pythonanywhere.com`
- **Source code**: `/home/seuusuario/gestor-juridico`
- **Working directory**: `/home/seuusuario/gestor-juridico/backend`

### **5. Configurar Banco de Dados**

#### **SQLite (Gratuito):**
```python
# Já configurado no wsgi.py
DATABASE_URL = 'sqlite:///./gestor_juridico.db'
```

### **6. Testar o Deploy**

#### **URLs para testar:**
- **Frontend**: `https://seuusuario.pythonanywhere.com/`
- **Backend**: `https://seuusuario.pythonanywhere.com/docs`
- **Health**: `https://seuusuario.pythonanywhere.com/health`

## 🔧 Configurações Avançadas

### **Variáveis de Ambiente:**
```bash
ENVIRONMENT=production
DATABASE_URL=sqlite:///./gestor_juridico.db
SECRET_KEY=sua_chave_secreta_aqui
```

### **Logs:**
- **Error log**: `/var/log/seuusuario.pythonanywhere.com.error.log`
- **Access log**: `/var/log/seuusuario.pythonanywhere.com.access.log`

## 📊 Vantagens do PythonAnywhere

### **✅ Gratuito:**
- 3 meses de CPU time
- Domínio personalizado
- SQLite incluído
- SSL automático

### **✅ Fácil:**
- Sem Docker
- Sem problemas de `cd`
- Git clone direto
- Logs simples

### **✅ Confiável:**
- Python nativo
- Sem cache de build
- Deploy instantâneo
- Debug fácil

## 🚨 Troubleshooting

### **Se der erro de import:**
```bash
# Verificar se o path está correto
python3.10 -c "import sys; print(sys.path)"

# Adicionar ao path se necessário
export PYTHONPATH="/home/seuusuario/gestor-juridico/backend:$PYTHONPATH"
```

### **Se der erro de dependências:**
```bash
# Instalar uma por uma
pip3.10 install --user fastapi
pip3.10 install --user uvicorn
pip3.10 install --user sqlalchemy
```

### **Se der erro de permissão:**
```bash
# Dar permissão de execução
chmod +x pythonanywhere_start.py
```

## 🎯 Próximos Passos

1. **Criar conta** no PythonAnywhere
2. **Clone o repositório**
3. **Configure o web app**
4. **Teste o deploy**
5. **Acesse sua aplicação!**

**Muito mais simples que Railway!** 🚀
