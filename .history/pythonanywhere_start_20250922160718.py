#!/usr/bin/env python3
"""
Script de start para PythonAnywhere
"""
import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, '/home/seuusuario/gestor-juridico/backend')

# Configurar variáveis de ambiente
os.environ.setdefault('ENVIRONMENT', 'production')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./gestor_juridico.db')

if __name__ == "__main__":
    import uvicorn
    from app.main import app
    
    # Start do servidor
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
