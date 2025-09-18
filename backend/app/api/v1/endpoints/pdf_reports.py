# ===========================================
# ENDPOINTS DE RELATÓRIOS PDF
# ===========================================

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.pdf_generator import pdf_generator

router = APIRouter()

@router.get("/process/{process_id}")
async def generate_process_report(
    process_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gerar relatório PDF de um processo específico."""
    try:
        filepath = pdf_generator.generate_process_report(db, process_id, current_user)
        
        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gerar relatório PDF"
            )
        
        # Retornar arquivo para download
        filename = os.path.basename(filepath)
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/tasks")
async def generate_tasks_report(
    user_id: Optional[int] = Query(None, description="ID do usuário para filtrar tarefas"),
    date_from: Optional[date] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Data final (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Status das tarefas"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gerar relatório PDF de tarefas com filtros."""
    try:
        filepath = pdf_generator.generate_tasks_report(
            db, user_id, date_from, date_to, status
        )
        
        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gerar relatório PDF"
            )
        
        # Retornar arquivo para download
        filename = os.path.basename(filepath)
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/dashboard")
async def generate_dashboard_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gerar relatório PDF executivo do dashboard."""
    try:
        filepath = pdf_generator.generate_dashboard_report(db, current_user)
        
        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gerar relatório PDF"
            )
        
        # Retornar arquivo para download
        filename = os.path.basename(filepath)
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/custom")
async def generate_custom_report(
    title: str = Query(..., description="Título do relatório"),
    include_processes: bool = Query(True, description="Incluir dados de processos"),
    include_tasks: bool = Query(True, description="Incluir dados de tarefas"),
    include_users: bool = Query(False, description="Incluir dados de usuários"),
    date_from: Optional[date] = Query(None, description="Data inicial"),
    date_to: Optional[date] = Query(None, description="Data final"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gerar relatório PDF personalizado."""
    try:
        # Por enquanto, usar o relatório dashboard como base
        # TODO: Implementar relatório customizado
        filepath = pdf_generator.generate_dashboard_report(db, current_user)
        
        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gerar relatório PDF"
            )
        
        # Retornar arquivo para download
        filename = f"relatorio_personalizado_{title.lower().replace(' ', '_')}.pdf"
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/list")
async def list_generated_reports():
    """Listar relatórios PDF gerados."""
    try:
        reports_dir = "reports"
        
        if not os.path.exists(reports_dir):
            return {"reports": []}
        
        files = []
        for filename in os.listdir(reports_dir):
            if filename.endswith('.pdf'):
                filepath = os.path.join(reports_dir, filename)
                stat = os.stat(filepath)
                
                files.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created_at": stat.st_ctime,
                    "download_url": f"/api/v1/pdf-reports/download/{filename}"
                })
        
        # Ordenar por data de criação (mais recente primeiro)
        files.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {"reports": files}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar relatórios: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Fazer download de um relatório específico."""
    try:
        filepath = os.path.join("reports", filename)
        
        if not os.path.exists(filepath) or not filename.endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relatório não encontrado"
            )
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer download: {str(e)}"
        )

@router.delete("/cleanup")
async def cleanup_old_reports(
    days_old: int = Query(7, description="Deletar relatórios com mais de X dias"),
    current_user: User = Depends(get_current_user)
):
    """Limpar relatórios antigos."""
    try:
        import time
        
        reports_dir = "reports"
        if not os.path.exists(reports_dir):
            return {"deleted": 0, "message": "Diretório de relatórios não existe"}
        
        cutoff_time = time.time() - (days_old * 24 * 60 * 60)
        deleted_count = 0
        
        for filename in os.listdir(reports_dir):
            if filename.endswith('.pdf'):
                filepath = os.path.join(reports_dir, filename)
                if os.path.getctime(filepath) < cutoff_time:
                    os.remove(filepath)
                    deleted_count += 1
        
        return {
            "deleted": deleted_count,
            "message": f"Deletados {deleted_count} relatórios com mais de {days_old} dias"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao limpar relatórios: {str(e)}"
        )
