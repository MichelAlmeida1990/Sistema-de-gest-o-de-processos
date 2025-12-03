# 📚 Guia Completo de Funcionalidades

## 🎯 Visão Geral

Sistema completo de gestão jurídica com múltiplas funcionalidades integradas.

---

## 🚀 Como Acessar a Interface

1. **Inicie o frontend:**
   ```powershell
   cd frontend
   $env:VITE_API_URL = "http://localhost:8000/api/v1"
   npm run dev
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:3002
   ```

3. **Faça login:**
   - **Admin:** `admin@sistema.com` / `123456`
   - **Demo:** `demo@demo.com` / `demo123`
   - Ou clique no botão **"Entrar como Demo"**

---

## 📋 Funcionalidades Disponíveis

### 1. 🏠 **Dashboard** (`/dashboard`)

**O que faz:**
- Visão geral do sistema
- Estatísticas em tempo real
- Gráficos e métricas
- Atividades recentes
- Alertas e notificações

**Como acessar:**
- Menu lateral → **Dashboard** (ícone 📊)
- Ou acesse diretamente: `http://localhost:3002/dashboard`

**Funcionalidades:**
- ✅ Total de processos ativos
- ✅ Tarefas concluídas/pendentes
- ✅ Tempo médio de processamento
- ✅ Receita total
- ✅ Gráficos de performance
- ✅ Atividades recentes
- ✅ Alertas importantes

---

### 2. 📄 **Processos** (`/processes`)

**O que faz:**
- Gestão completa de processos judiciais
- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Filtros e buscas avançadas
- Integração com DataJud (CNJ)

**Como acessar:**
- Menu lateral → **Processos** (ícone 📄)
- Ou: `http://localhost:3002/processes`

**Funcionalidades:**
- ✅ Listar todos os processos
- ✅ Criar novo processo
- ✅ Editar processo existente
- ✅ Visualizar detalhes
- ✅ Buscar processos
- ✅ Filtrar por status, tipo, cliente
- ✅ Integração com DataJud para consultar processos reais
- ✅ Upload de documentos relacionados

---

### 3. ✅ **Tarefas** (`/tasks`)

**O que faz:**
- Gestão de tarefas e prazos
- Atribuição de responsáveis
- Status e prioridades
- Notificações de prazo

**Como acessar:**
- Menu lateral → **Tarefas** (ícone ✅)
- Ou: `http://localhost:3002/tasks`

**Funcionalidades:**
- ✅ Criar tarefas
- ✅ Atribuir responsáveis
- ✅ Definir prazos
- ✅ Marcar como concluída
- ✅ Filtrar por status
- ✅ Buscar tarefas
- ✅ Visualizar tarefas por processo

---

### 4. 📊 **Kanban** (`/kanban`)

**O que faz:**
- Visualização de tarefas em formato Kanban
- Drag and drop para mover tarefas
- Organização por colunas (To Do, In Progress, Done)

**Como acessar:**
- Menu lateral → **Kanban** (ícone 📊)
- Ou: `http://localhost:3002/kanban`

**Funcionalidades:**
- ✅ Visualização em colunas
- ✅ Arrastar e soltar tarefas
- ✅ Filtrar por responsável
- ✅ Visualizar detalhes da tarefa

---

### 5. ⏰ **Timeline** (`/timeline`)

**O que faz:**
- Histórico cronológico de eventos
- Linha do tempo de processos
- Atividades e movimentações

**Como acessar:**
- Menu lateral → **Timeline** (ícone ⏰)
- Ou: `http://localhost:3002/timeline`

**Funcionalidades:**
- ✅ Visualizar histórico completo
- ✅ Filtrar por processo
- ✅ Filtrar por tipo de evento
- ✅ Buscar eventos
- ✅ Exportar timeline

---

### 6. 📁 **Arquivos** (`/files`)

**O que faz:**
- Gerenciador de arquivos
- Upload e download de documentos
- Organização por processos
- Busca de arquivos

**Como acessar:**
- Menu lateral → **Arquivos** (ícone 📁)
- Ou: `http://localhost:3002/files`

**Funcionalidades:**
- ✅ Upload de arquivos
- ✅ Download de arquivos
- ✅ Organizar por processo
- ✅ Buscar arquivos
- ✅ Visualizar preview
- ✅ Gerenciar permissões

---

### 7. 📈 **Relatórios** (`/reports`)

**O que faz:**
- Geração de relatórios
- Gráficos e estatísticas
- Exportação em PDF
- Relatórios personalizados

**Como acessar:**
- Menu lateral → **Relatórios** (ícone 📈)
- Ou: `http://localhost:3002/reports`

**Funcionalidades:**
- ✅ Relatórios de processos
- ✅ Relatórios de tarefas
- ✅ Relatórios financeiros
- ✅ Gráficos e estatísticas
- ✅ Exportar em PDF
- ✅ Filtrar por período

---

### 8. 💰 **Precatórios** (`/precatorios`) ⭐ NOVO

**O que faz:**
- Gestão completa de precatórios
- Cálculo automático de atualização usando índices econômicos
- Integração com Banco Central do Brasil
- CRUD completo

**Como acessar:**
- Menu lateral → **Precatórios** (ícone 💰)
- Ou: `http://localhost:3002/precatorios`

**Funcionalidades:**
- ✅ Criar precatório
- ✅ Listar precatórios
- ✅ Editar precatório
- ✅ **Calcular atualização automática** (botão "Atualizar")
- ✅ Usar índices: IPCA-E, INPC, SELIC, TR
- ✅ Visualizar histórico de cálculos
- ✅ Filtrar por ente devedor, status, natureza
- ✅ Buscar precatórios

**Como usar o cálculo de atualização:**
1. Crie ou edite um precatório com:
   - Valor de origem
   - Data de inscrição
2. Clique no botão **"Atualizar"** na linha do precatório
3. O sistema calculará automaticamente usando IPCA-E
4. O valor atualizado será salvo automaticamente

---

### 9. 📤 **Entregas** (`/deliveries`)

**O que faz:**
- Gestão de entregas e envios
- Controle de documentos enviados
- Status de entrega

**Como acessar:**
- Menu lateral → **Entregas** (ícone 📤)
- Ou: `http://localhost:3002/deliveries`

**Funcionalidades:**
- ✅ Registrar entregas
- ✅ Acompanhar status
- ✅ Histórico de entregas

---

### 10. 💵 **Financeiro** (`/financial`)

**O que faz:**
- Gestão financeira
- Controle de receitas e despesas
- Relatórios financeiros

**Como acessar:**
- Menu lateral → **Financeiro** (ícone 💵)
- Ou: `http://localhost:3002/financial`

**Funcionalidades:**
- ✅ Controle de receitas
- ✅ Controle de despesas
- ✅ Relatórios financeiros
- ✅ Gráficos de receita

---

### 11. 🔔 **Notificações** (`/notifications`)

**O que faz:**
- Central de notificações
- Alertas e avisos
- Notificações em tempo real

**Como acessar:**
- Menu lateral → **Notificações** (ícone 🔔)
- Ou clique no ícone de sino no header
- Ou: `http://localhost:3002/notifications`

**Funcionalidades:**
- ✅ Visualizar todas as notificações
- ✅ Marcar como lida
- ✅ Filtrar por tipo
- ✅ Notificações em tempo real (WebSocket)

---

### 12. 🔍 **Busca** (`/search`)

**O que faz:**
- Busca global no sistema
- Pesquisa em processos, tarefas, arquivos

**Como acessar:**
- Menu lateral → **Busca** (ícone 🔍)
- Ou use a barra de busca no header
- Ou: `http://localhost:3002/search`

**Funcionalidades:**
- ✅ Busca em processos
- ✅ Busca em tarefas
- ✅ Busca em arquivos
- ✅ Filtros avançados

---

### 13. 📊 **Funil de Processos** (`/funnel`)

**O que faz:**
- Visualização de processos em funil
- Estágios do processo
- Métricas de conversão
- Automação de tarefas

**Como acessar:**
- Menu lateral → **Funil de Processos** (ícone 📊)
- Ou: `http://localhost:3002/funnel`

**Funcionalidades:**
- ✅ Visualizar processos por estágio
- ✅ Mover processos entre estágios
- ✅ Métricas de conversão
- ✅ Relatórios do funil
- ✅ Automação de tarefas
- ✅ Priorização inteligente

---

### 14. 🔌 **RD Station** (`/rdstation`)

**O que faz:**
- Integração com RD Station
- Sincronização de contatos
- Gestão de oportunidades

**Como acessar:**
- Menu lateral → **RD Station** (ícone 🔌)
- Ou: `http://localhost:3002/rdstation`

**Funcionalidades:**
- ✅ Sincronizar contatos
- ✅ Criar oportunidades
- ✅ Visualizar status da integração

---

### 15. ⚙️ **Admin** (`/admin`)

**O que faz:**
- Painel administrativo
- Gestão de usuários
- Configurações do sistema

**Como acessar:**
- Menu lateral → **Admin** (ícone ⚙️)
- Ou: `http://localhost:3002/admin`
- **Apenas para usuários admin**

**Funcionalidades:**
- ✅ Gerenciar usuários
- ✅ Configurações do sistema
- ✅ Logs e auditoria
- ✅ Estatísticas do sistema

---

## 🎨 Recursos da Interface

### Menu Lateral
- **Colapsável:** Clique no botão de menu para expandir/recolher
- **Responsivo:** Adapta-se automaticamente em mobile
- **Navegação:** Clique em qualquer item para navegar

### Header (Topo)
- **Busca:** Barra de busca global (desktop)
- **Notificações:** Ícone de sino com contador
- **Modo Escuro:** Toggle para dark mode
- **Perfil do Usuário:** Menu dropdown com opções

### Funcionalidades Globais
- ✅ **Dark Mode:** Toggle no header
- ✅ **Notificações em Tempo Real:** WebSocket
- ✅ **Busca Global:** Barra de busca no header
- ✅ **Responsivo:** Funciona em mobile e desktop

---

## 🔑 Credenciais de Teste

### Admin (Acesso Completo)
- **Email:** `admin@sistema.com`
- **Senha:** `123456`
- **Acesso:** Todas as funcionalidades

### Demo (Acesso Limitado)
- **Email:** `demo@demo.com`
- **Senha:** `demo123`
- **Acesso:** Funcionalidades básicas

---

## 📱 Acesso Mobile

O sistema detecta automaticamente dispositivos mobile e:
- Mostra layout otimizado para mobile
- Menu lateral vira drawer
- Interface adaptada para touch

---

## 🆕 Funcionalidades Recentes

### Precatórios com Cálculo Automático
- ✅ Integração com API do Banco Central
- ✅ Cálculo automático de atualização
- ✅ Suporte a múltiplos índices (IPCA-E, INPC, SELIC, TR)
- ✅ Histórico de cálculos

### Índices Econômicos
- ✅ Consulta de índices do Banco Central
- ✅ Cálculo de atualização de valores
- ✅ Histórico mês a mês

---

## 🎯 Dicas de Uso

1. **Comece pelo Dashboard:** Veja uma visão geral do sistema
2. **Use a Busca:** Encontre rapidamente processos, tarefas ou arquivos
3. **Configure Notificações:** Mantenha-se atualizado sobre prazos
4. **Explore o Funil:** Visualize processos por estágio
5. **Teste Precatórios:** Use o cálculo automático de atualização

---

## 🐛 Problemas Comuns

### Não consigo fazer login
- Verifique se o backend está rodando: `http://localhost:8000/health`
- Verifique se está usando `http://localhost:3002` (não o Render)

### Erro de CORS
- Certifique-se de que o frontend está usando `http://localhost:8000/api/v1`
- Reinicie o servidor Vite após configurar a variável de ambiente

### Página não carrega
- Verifique o console do navegador (F12)
- Verifique se o backend está respondendo

---

## 📚 Documentação Adicional

- **API:** `http://localhost:8000/docs` (Swagger UI)
- **Testes:** Veja `TESTE-API.md` para testar a API
- **Deploy:** Veja `README.md` para instruções de deploy

---

**🎉 Explore todas as funcionalidades e aproveite o sistema!**




