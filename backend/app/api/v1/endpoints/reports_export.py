# ===========================================
# ENDPOINT DE EXPORTAÇÃO DE RELATÓRIOS
# ===========================================

from fastapi import APIRouter, HTTPException, status, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import io
import logging
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.process import Process
from app.models.task import Task

logger = logging.getLogger(__name__)

router = APIRouter()

def generate_report_pdf(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_ids: Optional[list] = None,
    db: Session = None
) -> bytes:
    """Gerar PDF do relatório."""
    
    # Criar buffer para o PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#031f5f')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.HexColor('#00afee')
    )
    
    # Conteúdo do PDF
    story = []
    
    # Título
    story.append(Paragraph("RELATÓRIO DE GESTÃO DE PROCESSOS", title_style))
    story.append(Spacer(1, 20))
    
    # Informações do relatório
    story.append(Paragraph(f"<b>Tipo:</b> {report_type.title()}", styles['Normal']))
    story.append(Paragraph(f"<b>Gerado em:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
    if start_date and end_date:
        story.append(Paragraph(f"<b>Período:</b> {start_date} a {end_date}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Dados do relatório baseados no tipo
    if report_type == 'productivity':
        story.append(Paragraph("MÉTRICAS DE PRODUTIVIDADE", heading_style))
        
        # Buscar dados reais do banco
        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == 'completed').count()
        
        productivity_data = [
            ['Métrica', 'Valor'],
            ['Total de Tarefas', str(total_tasks)],
            ['Tarefas Concluídas', str(completed_tasks)],
            ['Taxa de Conclusão', f'{(completed_tasks/total_tasks*100):.1f}%' if total_tasks > 0 else '0%'],
            ['Tarefas Pendentes', str(total_tasks - completed_tasks)]
        ]
        
        table = Table(productivity_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        
    elif report_type == 'financial':
        story.append(Paragraph("MÉTRICAS FINANCEIRAS", heading_style))
        
        # Buscar dados financeiros reais
        total_processes = db.query(Process).count()
        processes_with_value = db.query(Process).filter(Process.actual_value.isnot(None)).count()
        
        financial_data = [
            ['Métrica', 'Valor'],
            ['Total de Processos', str(total_processes)],
            ['Processos com Valor', str(processes_with_value)],
            ['Processos Sem Valor', str(total_processes - processes_with_value)]
        ]
        
        table = Table(financial_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        
    elif report_type == 'process':
        story.append(Paragraph("MÉTRICAS DE PROCESSOS", heading_style))
        
        # Buscar dados de processos reais
        active_processes = db.query(Process).filter(Process.status == 'active').count()
        completed_processes = db.query(Process).filter(Process.status == 'completed').count()
        pending_processes = db.query(Process).filter(Process.status == 'pending').count()
        
        process_data = [
            ['Status', 'Quantidade'],
            ['Ativos', str(active_processes)],
            ['Concluídos', str(completed_processes)],
            ['Pendentes', str(pending_processes)],
            ['Total', str(active_processes + completed_processes + pending_processes)]
        ]
        
        table = Table(process_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#031f5f')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
    
    # Rodapé
    story.append(Spacer(1, 30))
    story.append(Paragraph("Relatório gerado automaticamente pelo Sistema de Gestão de Processos", 
                          ParagraphStyle('Footer', parent=styles['Normal'], 
                                       fontSize=8, alignment=TA_CENTER, 
                                       textColor=colors.grey)))
    
    # Construir PDF
    doc.build(story)
    
    # Retornar bytes do PDF
    buffer.seek(0)
    return buffer.getvalue()

@router.get("/export/pdf")
async def export_report_pdf(
    report_type: str = "productivity",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_ids: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exportar relatório em formato PDF."""
    try:
        logger.info(f"Gerando PDF para usuário {current_user.id}, tipo: {report_type}")
        
        # Converter user_ids de string para lista se necessário
        user_list = None
        if user_ids:
            user_list = [int(uid.strip()) for uid in user_ids.split(',')]
        
        # Gerar PDF
        pdf_bytes = generate_report_pdf(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            user_ids=user_list,
            db=db
        )
        
        # Criar nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"relatorio_{report_type}_{timestamp}.pdf"
        
        # Retornar PDF como download
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório PDF: {str(e)}"
        )

@router.get("/export/excel")
async def export_report_excel(
    report_type: str = "productivity",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_ids: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exportar relatório em formato Excel."""
    try:
        # Por enquanto, retornar uma resposta simulada
        # TODO: Implementar geração real de Excel
        return {
            "message": f"Relatório {report_type} exportado em formato Excel",
            "filename": f"relatorio_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar Excel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório Excel: {str(e)}"
        )

@router.get("/export/csv")
async def export_report_csv(
    report_type: str = "productivity",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_ids: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exportar relatório em formato CSV."""
    try:
        # Por enquanto, retornar uma resposta simulada
        # TODO: Implementar geração real de CSV
        return {
            "message": f"Relatório {report_type} exportado em formato CSV",
            "filename": f"relatorio_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório CSV: {str(e)}"
        )



