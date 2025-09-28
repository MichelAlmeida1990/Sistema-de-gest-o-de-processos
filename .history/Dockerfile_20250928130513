# Dockerfile otimizado para Render - Python 3.11
FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Instalar Jinja2 primeiro para garantir que está disponível
RUN pip install --no-cache-dir jinja2==3.1.2

# Copiar requirements e instalar dependências Python
COPY backend/requirements-ultra-simple.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY backend/ .

# Criar diretórios necessários
RUN mkdir -p uploads logs reports

# Configurar variáveis de ambiente
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expor porta
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
