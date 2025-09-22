"""
WSGI configuration para PythonAnywhere
"""
import os
import sys

# Adicionar o diretório do projeto ao path
path = '/home/seuusuario/gestor-juridico/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Configurar variáveis de ambiente
os.environ.setdefault('ENVIRONMENT', 'production')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./gestor_juridico.db')

# Importar a aplicação
from app.main import app

# Para PythonAnywhere
application = app
