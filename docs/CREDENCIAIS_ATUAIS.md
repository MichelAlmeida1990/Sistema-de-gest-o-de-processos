# 🔑 Credenciais Atuais do Sistema

## 👤 Usuário Administrador Principal

**Email:** `admin@sistema.com`  
**Senha:** `123456`  
**Perfil:** Administrador completo  
**Status:** Criado automaticamente na inicialização do servidor

---

## 👥 Outros Usuários de Teste

Estes usuários são criados pelo script `seed_data.py`:

### 1. Advogado
- **Email:** `joao.advogado@escritorio.com`
- **Senha:** `123456`
- **Perfil:** Advogado
- **Nome:** João Silva Advogado

### 2. Assistente/Calculista
- **Email:** `maria.calculista@escritorio.com`
- **Senha:** `123456`
- **Perfil:** Assistente
- **Nome:** Maria Santos Calculista

### 3. Cliente
- **Email:** `carlos.cliente@email.com`
- **Senha:** `123456`
- **Perfil:** Cliente
- **Nome:** Carlos Lima Cliente

### 4. Assistente
- **Email:** `ana.assistente@escritorio.com`
- **Senha:** `123456`
- **Perfil:** Assistente
- **Nome:** Ana Costa Assistente

---

## 🔧 Usuário Admin Alternativo

**Email:** `admin@teste.com`  
**Senha:** `admin123`  
**Perfil:** Administrador  
**Nota:** Criado pelo script `create_admin.py` (pode não existir se o script não foi executado)

---

## 📋 Resumo Rápido

| Email | Senha | Perfil |
|-------|-------|--------|
| `admin@sistema.com` | `123456` | Administrador |
| `joao.advogado@escritorio.com` | `123456` | Advogado |
| `maria.calculista@escritorio.com` | `123456` | Assistente |
| `carlos.cliente@email.com` | `123456` | Cliente |
| `ana.assistente@escritorio.com` | `123456` | Assistente |

---

## ⚠️ Importante

- **Todas as senhas são:** `123456` (padrão para desenvolvimento)
- **O usuário admin principal** é criado automaticamente quando o servidor inicia
- **Os outros usuários** são criados pelo script `seed_data.py` (se executado)
- **Para produção**, altere todas as senhas!

---

## 🚀 Como Criar os Usuários

Se os usuários não existirem, execute:

```bash
cd backend
python seed_data.py
```

Isso criará todos os usuários listados acima.

---

**Status**: ✅ Credenciais documentadas



