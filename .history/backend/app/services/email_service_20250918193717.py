# ===========================================
# SERVIÇO DE EMAIL
# ===========================================

import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional, Dict, Any
from jinja2 import Environment, BaseLoader
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Serviço para envio de emails."""
    
    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@sistema.com')
        self.from_name = getattr(settings, 'FROM_NAME', 'Sistema de Gestão')
        
        # Templates de email
        self.templates = {
            'task_assigned': {
                'subject': 'Nova Tarefa Atribuída - {{task_title}}',
                'html': '''
                <h2>Nova Tarefa Atribuída</h2>
                <p>Olá {{user_name}},</p>
                <p>Uma nova tarefa foi atribuída para você:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3>{{task_title}}</h3>
                    <p><strong>Descrição:</strong> {{task_description}}</p>
                    <p><strong>Prioridade:</strong> {{task_priority}}</p>
                    <p><strong>Prazo:</strong> {{task_due_date}}</p>
                    <p><strong>Processo:</strong> {{process_title}}</p>
                </div>
                <p>Acesse o sistema para mais detalhes: <a href="{{system_url}}/tasks/{{task_id}}">Ver Tarefa</a></p>
                <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
                '''
            },
            'task_completed': {
                'subject': 'Tarefa Concluída - {{task_title}}',
                'html': '''
                <h2>Tarefa Concluída</h2>
                <p>Olá {{user_name}},</p>
                <p>A tarefa "{{task_title}}" foi concluída por {{completer_name}}.</p>
                <div style="background: #e6ffe6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3>{{task_title}}</h3>
                    <p><strong>Concluída em:</strong> {{completion_date}}</p>
                    <p><strong>Processo:</strong> {{process_title}}</p>
                </div>
                <p>Acesse o sistema para mais detalhes: <a href="{{system_url}}/tasks/{{task_id}}">Ver Tarefa</a></p>
                <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
                '''
            },
            'deadline_warning': {
                'subject': 'Prazo se Aproximando - {{task_title}}',
                'html': '''
                <h2 style="color: #ff6b35;">Prazo se Aproximando</h2>
                <p>Olá {{user_name}},</p>
                <p>A tarefa "{{task_title}}" vence em {{days_remaining}} dia(s).</p>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff6b35;">
                    <h3>{{task_title}}</h3>
                    <p><strong>Prazo:</strong> {{task_due_date}}</p>
                    <p><strong>Prioridade:</strong> {{task_priority}}</p>
                    <p><strong>Processo:</strong> {{process_title}}</p>
                </div>
                <p><strong>Ação necessária:</strong> Acesse o sistema e complete esta tarefa o quanto antes.</p>
                <p>Acesse o sistema: <a href="{{system_url}}/tasks/{{task_id}}">Ver Tarefa</a></p>
                <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
                '''
            },
            'deadline_overdue': {
                'subject': 'URGENTE: Prazo Vencido - {{task_title}}',
                'html': '''
                <h2 style="color: #dc3545;">PRAZO VENCIDO</h2>
                <p>Olá {{user_name}},</p>
                <p><strong>ATENÇÃO:</strong> A tarefa "{{task_title}}" está atrasada há {{days_overdue}} dia(s).</p>
                <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545;">
                    <h3>{{task_title}}</h3>
                    <p><strong>Prazo Original:</strong> {{task_due_date}}</p>
                    <p><strong>Prioridade:</strong> {{task_priority}}</p>
                    <p><strong>Processo:</strong> {{process_title}}</p>
                </div>
                <p><strong>Ação URGENTE necessária:</strong> Complete esta tarefa imediatamente.</p>
                <p>Acesse o sistema: <a href="{{system_url}}/tasks/{{task_id}}">Ver Tarefa</a></p>
                <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
                '''
            },
            'welcome': {
                'subject': 'Bem-vindo ao Sistema de Gestão de Processos',
                'html': '''
                <h2>Bem-vindo ao Sistema!</h2>
                <p>Olá {{user_name}},</p>
                <p>Sua conta foi criada com sucesso no Sistema de Gestão de Processos.</p>
                <div style="background: #e6f3ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3>Detalhes da Conta</h3>
                    <p><strong>Email:</strong> {{user_email}}</p>
                    <p><strong>Username:</strong> {{user_username}}</p>
                    <p><strong>Perfil:</strong> {{user_role}}</p>
                </div>
                <p>Acesse o sistema: <a href="{{system_url}}">Fazer Login</a></p>
                <p>Para sua segurança, recomendamos alterar sua senha no primeiro acesso.</p>
                <p>Atenciosamente,<br>Equipe do Sistema de Gestão</p>
                '''
            }
        }
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """Enviar email."""
        
        try:
            # Configurar mensagem
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Adicionar conteúdo HTML
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Adicionar anexos se houver
            if attachments:
                for file_path in attachments:
                    if os.path.exists(file_path):
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                        
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(file_path)}'
                        )
                        msg.attach(part)
            
            # Enviar email
            if self.smtp_user and self.smtp_password:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                server.quit()
                
                logger.info(f"Email enviado para {to_email}: {subject}")
                return True
            else:
                logger.warning("Configurações SMTP não definidas. Email não enviado.")
                print(f"[MOCK EMAIL] Para: {to_email}")
                print(f"[MOCK EMAIL] Assunto: {subject}")
                print(f"[MOCK EMAIL] Conteúdo: {html_content[:100]}...")
                return True
                
        except Exception as e:
            logger.error(f"Erro ao enviar email para {to_email}: {e}")
            return False
    
    def render_template(self, template_name: str, **kwargs) -> Dict[str, str]:
        """Renderizar template de email."""
        
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' não encontrado")
        
        template = self.templates[template_name]
        
        # Configurar Jinja2
        env = Environment(loader=BaseLoader())
        
        # Renderizar subject e html
        subject_template = env.from_string(template['subject'])
        html_template = env.from_string(template['html'])
        
        # Adicionar URL do sistema se não fornecida
        if 'system_url' not in kwargs:
            kwargs['system_url'] = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
        return {
            'subject': subject_template.render(**kwargs),
            'html': html_template.render(**kwargs)
        }
    
    async def send_task_assigned_email(
        self,
        user_email: str,
        user_name: str,
        task_title: str,
        task_description: str,
        task_priority: str,
        task_due_date: str,
        process_title: str,
        task_id: int
    ) -> bool:
        """Enviar email de tarefa atribuída."""
        
        try:
            rendered = self.render_template('task_assigned',
                user_name=user_name,
                task_title=task_title,
                task_description=task_description,
                task_priority=task_priority,
                task_due_date=task_due_date,
                process_title=process_title,
                task_id=task_id
            )
            
            return await self.send_email(
                to_email=user_email,
                subject=rendered['subject'],
                html_content=rendered['html']
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar email de tarefa atribuída: {e}")
            return False
    
    async def send_task_completed_email(
        self,
        user_email: str,
        user_name: str,
        task_title: str,
        completer_name: str,
        completion_date: str,
        process_title: str,
        task_id: int
    ) -> bool:
        """Enviar email de tarefa concluída."""
        
        try:
            rendered = self.render_template('task_completed',
                user_name=user_name,
                task_title=task_title,
                completer_name=completer_name,
                completion_date=completion_date,
                process_title=process_title,
                task_id=task_id
            )
            
            return await self.send_email(
                to_email=user_email,
                subject=rendered['subject'],
                html_content=rendered['html']
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar email de tarefa concluída: {e}")
            return False
    
    async def send_deadline_warning_email(
        self,
        user_email: str,
        user_name: str,
        task_title: str,
        task_due_date: str,
        task_priority: str,
        process_title: str,
        days_remaining: int,
        task_id: int
    ) -> bool:
        """Enviar email de aviso de prazo."""
        
        try:
            rendered = self.render_template('deadline_warning',
                user_name=user_name,
                task_title=task_title,
                task_due_date=task_due_date,
                task_priority=task_priority,
                process_title=process_title,
                days_remaining=days_remaining,
                task_id=task_id
            )
            
            return await self.send_email(
                to_email=user_email,
                subject=rendered['subject'],
                html_content=rendered['html']
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar email de aviso de prazo: {e}")
            return False
    
    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        user_username: str,
        user_role: str
    ) -> bool:
        """Enviar email de boas-vindas."""
        
        try:
            rendered = self.render_template('welcome',
                user_name=user_name,
                user_email=user_email,
                user_username=user_username,
                user_role=user_role
            )
            
            return await self.send_email(
                to_email=user_email,
                subject=rendered['subject'],
                html_content=rendered['html']
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar email de boas-vindas: {e}")
            return False
    
    async def send_report_email(
        self,
        user_email: str,
        user_name: str,
        report_title: str,
        report_filepath: str
    ) -> bool:
        """Enviar relatório por email."""
        
        try:
            subject = f"Relatório: {report_title}"
            html_content = f"""
            <h2>Relatório Solicitado</h2>
            <p>Olá {user_name},</p>
            <p>Segue em anexo o relatório "{report_title}" que você solicitou.</p>
            <p>O relatório foi gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}.</p>
            <p>Acesse o sistema: <a href="{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}">Sistema de Gestão</a></p>
            <p>Atenciosamente,<br>Sistema de Gestão de Processos</p>
            """
            
            return await self.send_email(
                to_email=user_email,
                subject=subject,
                html_content=html_content,
                attachments=[report_filepath] if os.path.exists(report_filepath) else None
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar relatório por email: {e}")
            return False
    
    async def send_bulk_notification(
        self,
        user_emails: List[str],
        subject: str,
        html_content: str
    ) -> Dict[str, int]:
        """Enviar notificação em massa."""
        
        results = {'sent': 0, 'failed': 0}
        
        for email in user_emails:
            try:
                success = await self.send_email(email, subject, html_content)
                if success:
                    results['sent'] += 1
                else:
                    results['failed'] += 1
                    
                # Pequeno delay para não sobrecarregar o servidor SMTP
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Erro ao enviar email para {email}: {e}")
                results['failed'] += 1
        
        return results
    
    def test_smtp_connection(self) -> bool:
        """Testar conexão SMTP."""
        
        try:
            if not self.smtp_user or not self.smtp_password:
                logger.warning("Credenciais SMTP não configuradas")
                return False
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.quit()
            
            logger.info("Conexão SMTP testada com sucesso")
            return True
            
        except Exception as e:
            logger.error(f"Erro na conexão SMTP: {e}")
            return False

# Instância global do serviço
email_service = EmailService()
