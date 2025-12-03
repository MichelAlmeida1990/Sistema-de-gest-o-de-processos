# 📁 Estrutura do Projeto

## 📂 Organização de Arquivos

### 🗂️ Raiz do Projeto

Arquivos essenciais que devem ficar na raiz:

#### Configuração e Deploy
- `README.md` - Documentação principal
- `docker-compose.yml` - Configuração Docker (desenvolvimento)
- `docker-compose.prod.yml` - Configuração Docker (produção)
- `Dockerfile` - Imagem Docker
- `env.example` - Exemplo de variáveis de ambiente
- `.gitignore` - Arquivos ignorados pelo Git

#### Deploy
- `netlify.toml` - Configuração Netlify
- `render.yaml` - Configuração Render
- `pythonanywhere_*.py` - Scripts PythonAnywhere
- `pythonanywhere_requirements.txt` - Dependências PythonAnywhere
- `runtime.txt` - Versão Python para deploy

#### Scripts de Inicialização
- `start-all.ps1` - Iniciar todos os serviços (Windows)
- `start-backend.ps1` - Iniciar backend (Windows)
- `start-frontend.ps1` - Iniciar frontend (Windows)

#### Outros
- `test_user.json` - Dados de teste (se necessário)

### 📚 Pasta `docs/`

Toda a documentação do projeto:

- `INDEX.md` - Índice da documentação
- `COMO_TESTAR_SISTEMA.md` - Guia de testes
- `CREDENCIAIS_ATUAIS.md` - Credenciais de acesso
- `GUIA-FUNCIONALIDADES.md` - Guia de funcionalidades
- `GUIA_HUGGINGFACE.md` - Guia de IA
- `CHAT_VERIFICADO.md` - Documentação do chat
- `DADOS-EXEMPLO.md` - Dados de exemplo
- `ROADMAP-MELHORIAS.md` - Roadmap
- `DEPLOY_PYTHONANYWHERE.md` - Deploy PythonAnywhere
- `DEPLOY_RENDER.md` - Deploy Render
- `netlify-deploy.md` - Deploy Netlify
- `DOCUMENTACAO_LIMPA.md` - Índice da documentação
- `ESTRUTURA_PROJETO.md` - Este arquivo

### 🔧 Pasta `scripts/`

Scripts de automação e utilitários:

- `deploy-*.sh` / `deploy-*.ps1` - Scripts de deploy
- `setup.sh` - Script de configuração
- `start-dev.sh` / `stop-dev.sh` - Scripts de desenvolvimento
- `test-system.ps1` - Script de testes (PowerShell)
- `testar-sistema.py` - Script de testes (Python)
- `generate-keys.py` - Geração de chaves
- `railway-setup.sh` - Configuração Railway

### 🐍 Pasta `backend/`

API FastAPI:

- `app/` - Código da aplicação
  - `api/v1/endpoints/` - Endpoints da API
  - `core/` - Configurações centrais
  - `models/` - Modelos do banco de dados
  - `schemas/` - Schemas Pydantic
  - `services/` - Lógica de negócio
- `tests/` - Testes automatizados
- `requirements.txt` - Dependências Python
- `test_*.py` - Scripts de teste
- `Dockerfile` - Imagem Docker do backend

### ⚛️ Pasta `frontend/`

Aplicação React:

- `src/` - Código fonte
  - `components/` - Componentes React
  - `pages/` - Páginas da aplicação
  - `services/` - Serviços de API
  - `hooks/` - React Hooks
  - `utils/` - Utilitários
  - `styles/` - Estilos CSS
- `public/` - Arquivos públicos
- `package.json` - Dependências Node.js
- `Dockerfile` - Imagem Docker do frontend

### 🔒 Arquivos que NÃO devem ser commitados

- `.env` - Variáveis de ambiente (contém secrets)
- `__pycache__/` - Cache Python
- `*.pyc` - Bytecode Python
- `node_modules/` - Dependências Node.js
- `dist/` / `build/` - Build outputs
- `.history/` - Histórico do editor
- `uploads/` - Arquivos enviados pelos usuários
- `logs/` - Arquivos de log
- `backups/` - Backups do banco de dados

## 📋 Regras de Organização

1. **Documentação** → `docs/`
2. **Scripts** → `scripts/`
3. **Configuração** → Raiz (apenas essenciais)
4. **Código** → `backend/` e `frontend/`
5. **Arquivos temporários** → Não commitados

## ✅ Checklist de Organização

- [x] Documentação organizada em `docs/`
- [x] Scripts organizados em `scripts/`
- [x] Raiz limpa (apenas arquivos essenciais)
- [x] README.md atualizado com referências
- [x] Índice criado em `docs/INDEX.md`
- [x] `.gitignore` configurado corretamente

---

**Última atualização:** 2025-12-03

