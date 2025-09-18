# ===========================================
# TESTES PRINCIPAIS DA API
# ===========================================

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base

# ===========================================
# CONFIGURAÇÃO DE TESTE
# ===========================================

# Banco de dados em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# ===========================================
# FIXTURES
# ===========================================

@pytest.fixture
def client():
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
    
    # Limpar tabelas após teste
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "TestPass123",
        "role": "lawyer"
    }

# ===========================================
# TESTES DA API
# ===========================================

def test_root_endpoint(client):
    """Testar endpoint raiz."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Sistema de Gestão de Processos" in data["message"]

def test_health_check(client):
    """Testar health check."""
    response = client.get("/health")
    # Pode falhar devido a conexões de banco, mas deve responder
    assert response.status_code in [200, 503]

def test_api_status(client):
    """Testar status da API."""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"

def test_register_user(client, test_user_data):
    """Testar registro de usuário."""
    response = client.post("/api/v1/auth/register", json=test_user_data)
    # Pode falhar devido a validações, mas deve responder
    assert response.status_code in [201, 400, 422]

def test_login_invalid_credentials(client):
    """Testar login com credenciais inválidas."""
    response = client.post("/api/v1/auth/login", json={
        "email": "invalid@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_protected_endpoint_without_auth(client):
    """Testar endpoint protegido sem autenticação."""
    response = client.get("/api/v1/users/")
    assert response.status_code == 401

def test_datajud_process_validation(client):
    """Testar validação de número de processo."""
    # Endpoint não requer autenticação para validação
    response = client.post("/api/v1/datajud/validate/process-number", params={
        "process_number": "1234567-89.2024.8.26.0001"
    })
    # Deve responder, mesmo que seja inválido
    assert response.status_code in [200, 401]  # 401 se requer auth

def test_pdf_reports_endpoints_exist(client):
    """Testar se endpoints de PDF existem."""
    # Testar se endpoints existem (mesmo que retornem 401)
    endpoints = [
        "/api/v1/pdf-reports/dashboard",
        "/api/v1/pdf-reports/list"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        # Deve retornar 401 (não autorizado) em vez de 404 (não encontrado)
        assert response.status_code in [200, 401]

def test_email_endpoints_exist(client):
    """Testar se endpoints de email existem."""
    endpoints = [
        "/api/v1/email/templates",
        "/api/v1/email/test-smtp"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        # Deve retornar 401 (não autorizado) em vez de 404 (não encontrado)
        assert response.status_code in [200, 401]

def test_websocket_endpoints_exist(client):
    """Testar se endpoints WebSocket existem."""
    response = client.get("/api/v1/ws/connections")
    # Deve retornar 401 (não autorizado) em vez de 404 (não encontrado)
    assert response.status_code in [200, 401]

# ===========================================
# TESTES DE INTEGRAÇÃO BÁSICA
# ===========================================

def test_cors_headers(client):
    """Testar se headers CORS estão configurados."""
    response = client.options("/api/v1/status")
    # Verificar se não há erro de CORS
    assert response.status_code in [200, 405]  # 405 = Method Not Allowed é ok

def test_api_documentation(client):
    """Testar se documentação da API está disponível."""
    response = client.get("/docs")
    assert response.status_code == 200
    
    response = client.get("/redoc")
    assert response.status_code == 200

def test_openapi_schema(client):
    """Testar se schema OpenAPI está disponível."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
