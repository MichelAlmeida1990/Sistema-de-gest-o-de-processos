# ===========================================
# SERVIÇO DE GERAÇÃO DE PDF
# ===========================================

import os
import io
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from jinja2 import Environment, FileSystemLoader

# Importação opcional do WeasyPrint (pode não estar disponível em alguns sistemas)
try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("⚠️  WeasyPrint não está disponível. Usando apenas ReportLab para geração de PDFs.")

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.process import Process
from app.models.task import Task
from app.models.timeline import TimelineEvent

class PDFGenerator:
    """Serviço para geração de relatórios em PDF."""
    
    def __init__(self):
        self.templates_dir = "app/templates/pdf"
        self.output_dir = "reports"
        
        # Criar diretórios se não existirem
        os.makedirs(self.templates_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Configurar Jinja2
        self.jinja_env = Environment(loader=FileSystemLoader(self.templates_dir))
        
        # Estilos ReportLab
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#031f5f')
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#00afee')
        )
    
    def generate_process_report(self, db: Session, process_id: int, user: User) -> str:
        """Gerar relatório detalhado de um processo."""
        
        # Buscar dados do processo
        process = db.query(Process).filter(Process.id == process_id).first()
        if not process:
            raise ValueError("Processo não encontrado")
        
        # Buscar tarefas relacionadas
        tasks = db.query(Task).filter(Task.process_id == process_id).all()
        
        # Buscar eventos da timeline
        timeline_events = db.query(TimelineEvent).filter(
            TimelineEvent.process_id == process_id
        ).order_by(TimelineEvent.created_at.desc()).limit(20).all()
        
        # Preparar dados para o template
        data = {
            'process': process,
            'tasks': tasks,
            'timeline_events': timeline_events,
            'generated_by': user,
            'generated_at': datetime.now(),
            'total_tasks': len(tasks),
            'completed_tasks': len([t for t in tasks if t.status.value == 'completed']),
            'pending_tasks': len([t for t in tasks if t.status.value in ['todo', 'in_progress']])
        }
        
        # Gerar PDF
        filename = f"processo_{process.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        self._generate_process_pdf_reportlab(data, filepath)
        
        return filepath
    
    def generate_tasks_report(self, db: Session, user_id: Optional[int] = None, 
                            date_from: Optional[date] = None, 
                            date_to: Optional[date] = None,
                            status: Optional[str] = None) -> str:
        """Gerar relatório de tarefas com filtros."""
        
        # Construir query
        query = db.query(Task)
        
        if user_id:
            query = query.filter(Task.assigned_user_id == user_id)
        
        if date_from:
            query = query.filter(Task.created_at >= date_from)
        
        if date_to:
            query = query.filter(Task.created_at <= date_to)
        
        if status:
            query = query.filter(Task.status == status)
        
        tasks = query.order_by(Task.created_at.desc()).all()
        
        # Estatísticas
        stats = {
            'total': len(tasks),
            'completed': len([t for t in tasks if t.status.value == 'completed']),
            'in_progress': len([t for t in tasks if t.status.value == 'in_progress']),
            'pending': len([t for t in tasks if t.status.value == 'todo']),
            'cancelled': len([t for t in tasks if t.status.value == 'cancelled'])
        }
        
        # Preparar dados
        data = {
            'tasks': tasks,
            'stats': stats,
            'filters': {
                'user_id': user_id,
                'date_from': date_from,
                'date_to': date_to,
                'status': status
            },
            'generated_at': datetime.now()
        }
        
        # Gerar PDF
        filename = f"relatorio_tarefas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        self._generate_tasks_pdf_reportlab(data, filepath)
        
        return filepath
    
    def generate_dashboard_report(self, db: Session, user: User) -> str:
        """Gerar relatório executivo do dashboard."""
        
        # Buscar estatísticas gerais
        total_processes = db.query(Process).count()
        active_processes = db.query(Process).filter(Process.status == 'active').count()
        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == 'completed').count()
        total_users = db.query(User).count()
        
        # Processos por status
        process_stats = db.query(Process.status, db.func.count(Process.id)).group_by(Process.status).all()
        
        # Tarefas por status
        task_stats = db.query(Task.status, db.func.count(Task.id)).group_by(Task.status).all()
        
        # Preparar dados
        data = {
            'summary': {
                'total_processes': total_processes,
                'active_processes': active_processes,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'total_users': total_users
            },
            'process_stats': process_stats,
            'task_stats': task_stats,
            'generated_by': user,
            'generated_at': datetime.now()
        }
        
        # Gerar PDF
        filename = f"relatorio_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        self._generate_dashboard_pdf_reportlab(data, filepath)
        
        return filepath
    
    def _generate_process_pdf_reportlab(self, data: Dict[str, Any], filepath: str):
        """Gerar PDF do processo usando ReportLab."""
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Título
        title = Paragraph(f"Relatório do Processo: {data['process'].title}", self.title_style)
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Informações básicas do processo
        process_info = [
            ['Número do Processo:', data['process'].process_number or 'N/A'],
            ['Cliente:', data['process'].client_name],
            ['Status:', data['process'].status.value.title()],
            ['Prioridade:', data['process'].priority.value.title()],
            ['Data de Criação:', data['process'].created_at.strftime('%d/%m/%Y')],
            ['Valor Estimado:', f"R$ {data['process'].estimated_value or 0:.2f}"],
        ]
        
        info_table = Table(process_info, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 20))
        
        # Resumo de tarefas
        summary_title = Paragraph("Resumo de Tarefas", self.heading_style)
        story.append(summary_title)
        
        task_summary = [
            ['Total de Tarefas:', str(data['total_tasks'])],
            ['Tarefas Concluídas:', str(data['completed_tasks'])],
            ['Tarefas Pendentes:', str(data['pending_tasks'])],
            ['Taxa de Conclusão:', f"{(data['completed_tasks']/data['total_tasks']*100) if data['total_tasks'] > 0 else 0:.1f}%"]
        ]
        
        summary_table = Table(task_summary, colWidths=[2*inch, 1*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e6f3ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Lista de tarefas
        if data['tasks']:
            tasks_title = Paragraph("Lista de Tarefas", self.heading_style)
            story.append(tasks_title)
            
            tasks_data = [['Título', 'Status', 'Prioridade', 'Prazo']]
            
            for task in data['tasks']:
                tasks_data.append([
                    task.title[:30] + '...' if len(task.title) > 30 else task.title,
                    task.status.value.title(),
                    task.priority.value.title(),
                    task.due_date.strftime('%d/%m/%Y') if task.due_date else 'N/A'
                ])
            
            tasks_table = Table(tasks_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch])
            tasks_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
            ]))
            
            story.append(tasks_table)
        
        # Rodapé
        story.append(Spacer(1, 30))
        footer_text = f"Relatório gerado por {data['generated_by'].full_name} em {data['generated_at'].strftime('%d/%m/%Y às %H:%M')}"
        footer = Paragraph(footer_text, self.styles['Normal'])
        story.append(footer)
        
        # Construir PDF
        doc.build(story)
    
    def _generate_tasks_pdf_reportlab(self, data: Dict[str, Any], filepath: str):
        """Gerar PDF de relatório de tarefas usando ReportLab."""
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Título
        title = Paragraph("Relatório de Tarefas", self.title_style)
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Estatísticas
        stats_title = Paragraph("Estatísticas Gerais", self.heading_style)
        story.append(stats_title)
        
        stats_data = [
            ['Total de Tarefas:', str(data['stats']['total'])],
            ['Concluídas:', str(data['stats']['completed'])],
            ['Em Andamento:', str(data['stats']['in_progress'])],
            ['Pendentes:', str(data['stats']['pending'])],
            ['Canceladas:', str(data['stats']['cancelled'])]
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 1*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e6f3ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(stats_table)
        story.append(Spacer(1, 20))
        
        # Lista detalhada de tarefas
        if data['tasks']:
            tasks_title = Paragraph("Detalhamento das Tarefas", self.heading_style)
            story.append(tasks_title)
            
            tasks_data = [['Título', 'Status', 'Responsável', 'Processo', 'Criação']]
            
            for task in data['tasks']:
                tasks_data.append([
                    task.title[:25] + '...' if len(task.title) > 25 else task.title,
                    task.status.value.title(),
                    task.assigned_user.full_name[:15] + '...' if task.assigned_user and len(task.assigned_user.full_name) > 15 else (task.assigned_user.full_name if task.assigned_user else 'N/A'),
                    task.process.title[:20] + '...' if task.process and len(task.process.title) > 20 else (task.process.title if task.process else 'N/A'),
                    task.created_at.strftime('%d/%m/%Y')
                ])
            
            tasks_table = Table(tasks_data, colWidths=[1.8*inch, 0.8*inch, 1.2*inch, 1.5*inch, 0.7*inch])
            tasks_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
            ]))
            
            story.append(tasks_table)
        
        # Rodapé
        story.append(Spacer(1, 30))
        footer_text = f"Relatório gerado em {data['generated_at'].strftime('%d/%m/%Y às %H:%M')}"
        footer = Paragraph(footer_text, self.styles['Normal'])
        story.append(footer)
        
        # Construir PDF
        doc.build(story)
    
    def _generate_dashboard_pdf_reportlab(self, data: Dict[str, Any], filepath: str):
        """Gerar PDF do dashboard usando ReportLab."""
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Título
        title = Paragraph("Relatório Executivo - Dashboard", self.title_style)
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Resumo executivo
        summary_title = Paragraph("Resumo Executivo", self.heading_style)
        story.append(summary_title)
        
        summary_data = [
            ['Total de Processos:', str(data['summary']['total_processes'])],
            ['Processos Ativos:', str(data['summary']['active_processes'])],
            ['Total de Tarefas:', str(data['summary']['total_tasks'])],
            ['Tarefas Concluídas:', str(data['summary']['completed_tasks'])],
            ['Total de Usuários:', str(data['summary']['total_users'])]
        ]
        
        summary_table = Table(summary_data, colWidths=[2.5*inch, 1*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e6f3ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Distribuição de processos por status
        if data['process_stats']:
            process_title = Paragraph("Processos por Status", self.heading_style)
            story.append(process_title)
            
            process_data = [['Status', 'Quantidade']]
            for status, count in data['process_stats']:
                process_data.append([status.value.title(), str(count)])
            
            process_table = Table(process_data, colWidths=[2*inch, 1*inch])
            process_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(process_table)
            story.append(Spacer(1, 15))
        
        # Distribuição de tarefas por status
        if data['task_stats']:
            task_title = Paragraph("Tarefas por Status", self.heading_style)
            story.append(task_title)
            
            task_data = [['Status', 'Quantidade']]
            for status, count in data['task_stats']:
                task_data.append([status.value.title(), str(count)])
            
            task_table = Table(task_data, colWidths=[2*inch, 1*inch])
            task_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00afee')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(task_table)
        
        # Rodapé
        story.append(Spacer(1, 30))
        footer_text = f"Relatório gerado por {data['generated_by'].full_name} em {data['generated_at'].strftime('%d/%m/%Y às %H:%M')}"
        footer = Paragraph(footer_text, self.styles['Normal'])
        story.append(footer)
        
        # Construir PDF
        doc.build(story)

# Instância global do gerador
pdf_generator = PDFGenerator()
