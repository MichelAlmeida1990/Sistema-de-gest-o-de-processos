# ===========================================
# ENDPOINTS DE EMAIL
# ===========================================

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.services.email_service import email_service

router = APIRouter()

# ===========================================
# SCHEMAS
# ===========================================

class EmailRequest(BaseModel):
    """Schema para envio de email."""
    to_email: EmailStr
    subject: str
    html_content: str
    attachments: Optional[List[str]] = None

class BulkEmailRequest(BaseModel):
    """Schema para envio de email em massa."""
    to_emails: List[EmailStr]
    subject: str
    html_content: str

class TestEmailRequest(BaseModel):
    """Schema para teste de email."""
    to_email: EmailStr

# ===========================================
# ENDPOINTS
# ===========================================

@router.post("/send")
async def send_email(
    email_request: EmailRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Enviar email individual."""
    try:
        # Executar envio em background
        background_tasks.add_task(
            email_service.send_email,
            email_request.to_email,
            email_request.subject,
            email_request.html_content,
            email_request.attachments
        )
        
        return {
            "message": "Email adicionado à fila de envio",
            "to": email_request.to_email,
            "subject": email_request.subject
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar email: {str(e)}"
        )

@router.post("/send-bulk")
async def send_bulk_email(
    email_request: BulkEmailRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin)
):
    """Enviar email em massa (apenas admin)."""
    try:
        # Executar envio em background
        background_tasks.add_task(
            email_service.send_bulk_notification,
            email_request.to_emails,
            email_request.subject,
            email_request.html_content
        )
        
        return {
            "message": "Emails adicionados à fila de envio",
            "total_recipients": len(email_request.to_emails),
            "subject": email_request.subject
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar emails: {str(e)}"
        )

@router.post("/test")
async def test_email(
    test_request: TestEmailRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Enviar email de teste."""
    try:
        subject = "Teste do Sistema de Email"
        html_content = f"""
        <h2>Email de Teste</h2>
        <p>Olá!</p>
        <p>Este é um email de teste do Sistema de Gestão de Processos.</p>
        <p><strong>Enviado por:</strong> {current_user.full_name}</p>
        <p><strong>Data/Hora:</strong> {datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
        <p>Se você recebeu este email, significa que o sistema de email está funcionando corretamente.</p>
        <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
        """
        
        # Executar envio em background
        background_tasks.add_task(
            email_service.send_email,
            test_request.to_email,
            subject,
            html_content
        )
        
        return {
            "message": "Email de teste enviado",
            "to": test_request.to_email
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar email de teste: {str(e)}"
        )

@router.get("/test-smtp")
async def test_smtp_connection(
    current_user: User = Depends(require_admin)
):
    """Testar conexão SMTP."""
    try:
        is_connected = email_service.test_smtp_connection()
        
        return {
            "smtp_configured": bool(email_service.smtp_user and email_service.smtp_password),
            "connection_successful": is_connected,
            "smtp_host": email_service.smtp_host,
            "smtp_port": email_service.smtp_port,
            "smtp_user": email_service.smtp_user[:3] + "*" * (len(email_service.smtp_user) - 6) + email_service.smtp_user[-3:] if email_service.smtp_user else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao testar SMTP: {str(e)}"
        )

@router.get("/templates")
async def list_email_templates(
    current_user: User = Depends(get_current_user)
):
    """Listar templates de email disponíveis."""
    try:
        templates_info = []
        
        for template_name, template_data in email_service.templates.items():
            templates_info.append({
                "name": template_name,
                "subject_template": template_data['subject'],
                "description": {
                    'task_assigned': 'Email enviado quando uma tarefa é atribuída',
                    'task_completed': 'Email enviado quando uma tarefa é concluída',
                    'deadline_warning': 'Email de aviso quando prazo está se aproximando',
                    'deadline_overdue': 'Email de urgência quando prazo foi ultrapassado',
                    'welcome': 'Email de boas-vindas para novos usuários'
                }.get(template_name, 'Template personalizado')
            })
        
        return {
            "templates": templates_info,
            "total": len(templates_info)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar templates: {str(e)}"
        )

@router.post("/send-welcome/{user_id}")
async def send_welcome_email_to_user(
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Enviar email de boas-vindas para um usuário."""
    try:
        # Buscar usuário
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Executar envio em background
        background_tasks.add_task(
            email_service.send_welcome_email,
            user.email,
            user.full_name,
            user.username,
            user.role.value
        )
        
        return {
            "message": "Email de boas-vindas enviado",
            "user": user.full_name,
            "email": user.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar email de boas-vindas: {str(e)}"
        )
