# ===========================================
# EXCEÇÕES CUSTOMIZADAS
# ===========================================

from typing import Optional, Any, Dict


class CustomException(Exception):
    """Exceção base customizada."""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


# ===========================================
# EXCEÇÕES DE AUTENTICAÇÃO
# ===========================================

class AuthenticationError(CustomException):
    """Erro de autenticação."""
    
    def __init__(self, message: str = "Credenciais inválidas"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR"
        )


class AuthorizationError(CustomException):
    """Erro de autorização."""
    
    def __init__(self, message: str = "Acesso negado"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR"
        )


class TokenExpiredError(CustomException):
    """Token expirado."""
    
    def __init__(self, message: str = "Token expirado"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="TOKEN_EXPIRED"
        )


class InvalidTokenError(CustomException):
    """Token inválido."""
    
    def __init__(self, message: str = "Token inválido"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="INVALID_TOKEN"
        )


class TwoFactorRequiredError(CustomException):
    """2FA obrigatório."""
    
    def __init__(self, message: str = "Autenticação de dois fatores necessária"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="TWO_FACTOR_REQUIRED"
        )


# ===========================================
# EXCEÇÕES DE VALIDAÇÃO
# ===========================================

class ValidationError(CustomException):
    """Erro de validação."""
    
    def __init__(self, message: str = "Dados inválidos", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details
        )


class RequiredFieldError(ValidationError):
    """Campo obrigatório."""
    
    def __init__(self, field: str):
        super().__init__(
            message=f"Campo '{field}' é obrigatório",
            details={"field": field}
        )


# ===========================================
# EXCEÇÕES DE RECURSOS
# ===========================================

class NotFoundError(CustomException):
    """Recurso não encontrado."""
    
    def __init__(self, resource: str = "Recurso", resource_id: Optional[str] = None):
        message = f"{resource} não encontrado"
        if resource_id:
            message += f" (ID: {resource_id})"
        
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            details={"resource": resource, "resource_id": resource_id}
        )


class ConflictError(CustomException):
    """Conflito de recursos."""
    
    def __init__(self, message: str = "Conflito de recursos"):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONFLICT"
        )


class DuplicateError(ConflictError):
    """Recurso duplicado."""
    
    def __init__(self, resource: str, field: str, value: str):
        super().__init__(
            message=f"{resource} com {field} '{value}' já existe",
            details={"resource": resource, "field": field, "value": value}
        )


# ===========================================
# EXCEÇÕES DE ARQUIVO
# ===========================================

class FileError(CustomException):
    """Erro relacionado a arquivos."""
    
    def __init__(self, message: str = "Erro no processamento do arquivo"):
        super().__init__(
            message=message,
            status_code=400,
            error_code="FILE_ERROR"
        )


class FileTooLargeError(FileError):
    """Arquivo muito grande."""
    
    def __init__(self, max_size: int):
        super().__init__(
            message=f"Arquivo muito grande. Tamanho máximo: {max_size} bytes",
            details={"max_size": max_size}
        )


class InvalidFileTypeError(FileError):
    """Tipo de arquivo inválido."""
    
    def __init__(self, allowed_types: list):
        super().__init__(
            message=f"Tipo de arquivo não permitido. Tipos aceitos: {', '.join(allowed_types)}",
            details={"allowed_types": allowed_types}
        )


# ===========================================
# EXCEÇÕES DE API EXTERNA
# ===========================================

class ExternalAPIError(CustomException):
    """Erro em API externa."""
    
    def __init__(self, api_name: str, message: str = "Erro na API externa"):
        super().__init__(
            message=f"Erro na {api_name}: {message}",
            status_code=502,
            error_code="EXTERNAL_API_ERROR",
            details={"api_name": api_name}
        )


class DataJudAPIError(ExternalAPIError):
    """Erro específico da API DataJud."""
    
    def __init__(self, message: str = "Erro na API DataJud"):
        super().__init__("DataJud", message)


# ===========================================
# EXCEÇÕES DE BANCO DE DADOS
# ===========================================

class DatabaseError(CustomException):
    """Erro de banco de dados."""
    
    def __init__(self, message: str = "Erro no banco de dados"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR"
        )


class IntegrityError(DatabaseError):
    """Erro de integridade do banco."""
    
    def __init__(self, message: str = "Violação de integridade"):
        super().__init__(
            message=message,
            status_code=409,
            error_code="INTEGRITY_ERROR"
        )


# ===========================================
# EXCEÇÕES DE RATE LIMITING
# ===========================================

class RateLimitError(CustomException):
    """Erro de rate limiting."""
    
    def __init__(self, message: str = "Muitas tentativas. Tente novamente mais tarde"):
        super().__init__(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED"
        )


# ===========================================
# EXCEÇÕES DE NEGÓCIO
# ===========================================

class BusinessLogicError(CustomException):
    """Erro de lógica de negócio."""
    
    def __init__(self, message: str = "Erro na lógica de negócio"):
        super().__init__(
            message=message,
            status_code=400,
            error_code="BUSINESS_LOGIC_ERROR"
        )


class ProcessNotFoundError(NotFoundError):
    """Processo não encontrado."""
    
    def __init__(self, cnj_number: str):
        super().__init__("Processo", cnj_number)


class TaskNotFoundError(NotFoundError):
    """Tarefa não encontrada."""
    
    def __init__(self, task_id: int):
        super().__init__("Tarefa", str(task_id))


class UserNotFoundError(NotFoundError):
    """Usuário não encontrado."""
    
    def __init__(self, user_id: int):
        super().__init__("Usuário", str(user_id))


class InvalidProcessStatusError(BusinessLogicError):
    """Status de processo inválido."""
    
    def __init__(self, current_status: str, target_status: str):
        super().__init__(
            message=f"Não é possível alterar status de '{current_status}' para '{target_status}'",
            details={"current_status": current_status, "target_status": target_status}
        )






