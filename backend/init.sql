-- ===========================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
-- ===========================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar esquema se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Definir permissões
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Comentários sobre o banco
COMMENT ON DATABASE gestao_processos IS 'Banco de dados do Sistema de Gestão de Processos e Cálculos';














