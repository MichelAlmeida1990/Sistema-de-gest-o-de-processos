# ===========================================
# ENDPOINTS FINANCEIROS
# ===========================================

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.process import Process, ProcessStatus

logger = logging.getLogger(__name__)

router = APIRouter()

# ===========================================
# ENDPOINTS
# ===========================================

@router.get("/payments")
async def get_payments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    user_id: Optional[int] = None
):
    """Listar pagamentos com filtros."""
    try:
        # TODO: Implementar listagem real de pagamentos
        return {
            "payments": [
                {
                    "id": 1,
                    "user": {
                        "id": 1,
                        "name": "João Calculista",
                        "email": "joao@example.com"
                    },
                    "task": {
                        "id": 1,
                        "title": "Cálculo de Pensão Alimentícia"
                    },
                    "amount": 150.00,
                    "currency": "BRL",
                    "status": "pago",
                    "payment_date": "2024-01-01T12:00:00Z",
                    "due_date": "2024-01-15T23:59:59Z",
                    "created_at": "2024-01-01T00:00:00Z"
                },
                {
                    "id": 2,
                    "user": {
                        "id": 2,
                        "name": "Maria Calculista",
                        "email": "maria@example.com"
                    },
                    "task": {
                        "id": 2,
                        "title": "Cálculo de Danos Morais"
                    },
                    "amount": 200.00,
                    "currency": "BRL",
                    "status": "pendente",
                    "due_date": "2024-01-20T23:59:59Z",
                    "created_at": "2024-01-02T00:00:00Z"
                }
            ],
            "total": 2,
            "skip": skip,
            "limit": limit,
            "summary": {
                "total_amount": 350.00,
                "paid_amount": 150.00,
                "pending_amount": 200.00,
                "total_payments": 2,
                "paid_payments": 1,
                "pending_payments": 1
            }
        }
    except Exception as e:
        logger.error(f"Erro ao listar pagamentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/payments/{payment_id}")
async def get_payment(payment_id: int):
    """Obter pagamento por ID."""
    try:
        # TODO: Implementar obtenção real de pagamento
        if payment_id == 1:
            return {
                "id": 1,
                "user": {
                    "id": 1,
                    "name": "João Calculista",
                    "email": "joao@example.com"
                },
                "task": {
                    "id": 1,
                    "title": "Cálculo de Pensão Alimentícia",
                    "cnj_number": "0000001-23.2024.8.26.0100"
                },
                "amount": 150.00,
                "currency": "BRL",
                "status": "pago",
                "payment_date": "2024-01-01T12:00:00Z",
                "due_date": "2024-01-15T23:59:59Z",
                "payment_method": "transferência",
                "transaction_id": "TXN123456789",
                "notes": "Pagamento realizado via transferência bancária",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter pagamento {payment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/payments")
async def create_payment():
    """Criar novo pagamento."""
    try:
        # TODO: Implementar criação real de pagamento
        return {
            "id": 3,
            "amount": 175.00,
            "status": "pendente",
            "message": "Pagamento criado com sucesso"
        }
    except Exception as e:
        logger.error(f"Erro ao criar pagamento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/payments/{payment_id}/status")
async def update_payment_status(payment_id: int, status: str):
    """Atualizar status do pagamento."""
    try:
        # TODO: Implementar atualização real de status
        return {
            "payment_id": payment_id,
            "status": status,
            "message": "Status atualizado com sucesso"
        }
    except Exception as e:
        logger.error(f"Erro ao atualizar status do pagamento {payment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/summary")
async def get_financial_summary(db: Session = Depends(get_db)):
    """Obter resumo financeiro baseado em dados reais."""
    try:
        # Calcular receita total (soma dos valores reais dos processos)
        total_revenue_result = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            Process.actual_value.isnot(None)
        ).scalar()
        total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

        # Calcular receita mensal (últimos 30 dias)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        monthly_revenue_result = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= thirty_days_ago
            )
        ).scalar()
        monthly_revenue = float(monthly_revenue_result) if monthly_revenue_result else 0.0

        # Calcular crescimento (comparar com mês anterior)
        sixty_days_ago = datetime.now() - timedelta(days=60)
        previous_month_revenue_result = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= sixty_days_ago,
                Process.updated_at < thirty_days_ago
            )
        ).scalar()
        previous_month_revenue = float(previous_month_revenue_result) if previous_month_revenue_result else 0.0

        growth_rate = 0.0
        if previous_month_revenue > 0:
            growth_rate = ((monthly_revenue - previous_month_revenue) / previous_month_revenue) * 100

        # Calcular ticket médio
        process_count = db.query(func.count(Process.id)).filter(
            Process.actual_value.isnot(None)
        ).scalar()
        average_ticket = total_revenue / process_count if process_count > 0 else 0.0

        # Contar clientes únicos
        total_clients = db.query(func.count(func.distinct(Process.client_name))).scalar()
        active_clients = db.query(func.count(func.distinct(Process.client_name))).filter(
            Process.status == ProcessStatus.ACTIVE
        ).scalar()

        # Calcular pagamentos (simulado baseado em status dos processos)
        paid_payments = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.status == ProcessStatus.COMPLETED
            )
        ).scalar()
        paid_payments = float(paid_payments) if paid_payments else 0.0

        pending_payments = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.status == ProcessStatus.ACTIVE
            )
        ).scalar()
        pending_payments = float(pending_payments) if pending_payments else 0.0

        overdue_payments = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.status == ProcessStatus.PAUSED
            )
        ).scalar()
        overdue_payments = float(overdue_payments) if overdue_payments else 0.0

        return {
            "totalRevenue": total_revenue,
            "monthlyRevenue": monthly_revenue,
            "growthRate": round(growth_rate, 2),
            "averageTicket": round(average_ticket, 2),
            "totalClients": total_clients,
            "activeClients": active_clients,
            "pendingPayments": pending_payments,
            "paidPayments": paid_payments,
            "overduePayments": overdue_payments
        }
    except Exception as e:
        logger.error(f"Erro ao calcular resumo financeiro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/revenue-by-area")
async def get_revenue_by_area(db: Session = Depends(get_db)):
    """Obter receitas por área jurídica baseado em dados reais."""
    try:
        # Buscar receitas por categoria
        revenue_by_category = db.query(
            Process.category,
            func.coalesce(func.sum(Process.actual_value), 0).label('revenue'),
            func.count(Process.id).label('cases')
        ).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.category.isnot(None)
            )
        ).group_by(Process.category).all()

        # Calcular total para percentuais
        total_revenue = sum(float(item.revenue) for item in revenue_by_category)

        result = []
        for item in revenue_by_category:
            percentage = (float(item.revenue) / total_revenue * 100) if total_revenue > 0 else 0
            result.append({
                "area": item.category or "Não categorizado",
                "revenue": float(item.revenue),
                "percentage": round(percentage, 1),
                "cases": item.cases
            })

        return result
    except Exception as e:
        logger.error(f"Erro ao calcular receitas por área: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/monthly-trends")
async def get_monthly_trends(db: Session = Depends(get_db)):
    """Obter tendências mensais baseado em dados reais."""
    try:
        # Buscar dados dos últimos 6 meses
        trends = []
        for i in range(6):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            month_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
                and_(
                    Process.actual_value.isnot(None),
                    Process.updated_at >= month_start,
                    Process.updated_at < month_end
                )
            ).scalar()
            
            month_cases = db.query(func.count(Process.id)).filter(
                and_(
                    Process.actual_value.isnot(None),
                    Process.updated_at >= month_start,
                    Process.updated_at < month_end
                )
            ).scalar()

            trends.append({
                "month": month_start.strftime("%b"),
                "revenue": float(month_revenue) if month_revenue else 0.0,
                "cases": month_cases or 0
            })

        return list(reversed(trends))
    except Exception as e:
        logger.error(f"Erro ao calcular tendências mensais: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/top-clients")
async def get_top_clients(db: Session = Depends(get_db)):
    """Obter top clientes por receita baseado em dados reais."""
    try:
        top_clients = db.query(
            Process.client_name,
            func.coalesce(func.sum(Process.actual_value), 0).label('revenue'),
            func.count(Process.id).label('cases'),
            func.max(Process.updated_at).label('last_payment')
        ).filter(
            Process.actual_value.isnot(None)
        ).group_by(Process.client_name).order_by(
            func.sum(Process.actual_value).desc()
        ).limit(5).all()

        result = []
        for client in top_clients:
            result.append({
                "name": client.client_name,
                "revenue": float(client.revenue),
                "cases": client.cases,
                "lastPayment": client.last_payment.isoformat() if client.last_payment else None
            })

        return result
    except Exception as e:
        logger.error(f"Erro ao calcular top clientes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/insights")
async def get_financial_insights(db: Session = Depends(get_db)):
    """Gerar insights financeiros baseado em dados reais."""
    try:
        insights = []
        
        # Calcular crescimento
        current_month = datetime.now().replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        current_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= current_month
            )
        ).scalar()
        
        last_revenue = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.updated_at >= last_month,
                Process.updated_at < current_month
            )
        ).scalar()
        
        if last_revenue and last_revenue > 0:
            growth = ((float(current_revenue) - float(last_revenue)) / float(last_revenue)) * 100
            if growth > 0:
                insights.append({
                    "type": "success",
                    "title": "Crescimento Positivo",
                    "description": f"Receita aumentou {growth:.1f}% em relação ao mês anterior",
                    "value": f"+{growth:.1f}%",
                    "icon": "ArrowUpOutlined"
                })
            elif growth < -10:
                insights.append({
                    "type": "error",
                    "title": "Queda na Receita",
                    "description": f"Receita diminuiu {abs(growth):.1f}% em relação ao mês anterior",
                    "value": f"{growth:.1f}%",
                    "icon": "ArrowDownOutlined"
                })

        # Verificar pagamentos pendentes
        pending_amount = db.query(func.coalesce(func.sum(Process.actual_value), 0)).filter(
            and_(
                Process.actual_value.isnot(None),
                Process.status == ProcessStatus.ACTIVE
            )
        ).scalar()
        
        if pending_amount and float(pending_amount) > 0:
            insights.append({
                "type": "warning",
                "title": "Pagamentos Pendentes",
                "description": f"R$ {float(pending_amount):,.2f} em pagamentos pendentes",
                "value": f"R$ {float(pending_amount):,.2f}",
                "icon": "ClockCircleOutlined"
            })

        # Verificar ticket médio
        avg_ticket = db.query(func.avg(Process.actual_value)).filter(
            Process.actual_value.isnot(None)
        ).scalar()
        
        if avg_ticket and float(avg_ticket) > 5000:
            insights.append({
                "type": "info",
                "title": "Ticket Médio Alto",
                "description": f"Ticket médio de R$ {float(avg_ticket):,.2f} indica processos de alto valor",
                "value": f"R$ {float(avg_ticket):,.2f}",
                "icon": "DollarOutlined"
            })

        return insights
    except Exception as e:
        logger.error(f"Erro ao gerar insights financeiros: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/processes")
async def get_processes_financial(db: Session = Depends(get_db)):
    """Obter processos com dados financeiros."""
    try:
        processes = db.query(Process).filter(
            Process.actual_value.isnot(None)
        ).order_by(Process.updated_at.desc()).limit(50).all()

        result = []
        for process in processes:
            result.append({
                "id": process.id,
                "title": process.title,
                "processNumber": process.process_number,
                "clientName": process.client_name,
                "estimatedValue": float(process.estimated_value) if process.estimated_value else 0.0,
                "actualValue": float(process.actual_value) if process.actual_value else 0.0,
                "status": process.status.value,
                "category": process.category,
                "createdAt": process.created_at.isoformat(),
                "updatedAt": process.updated_at.isoformat()
            })

        return result
    except Exception as e:
        logger.error(f"Erro ao buscar processos financeiros: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/reports/export")
async def export_financial_report(
    format: str = "csv",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Exportar relatório financeiro."""
    try:
        # TODO: Implementar exportação real
        logger.info(f"Exportação solicitada: formato {format}")
        
        return {
            "message": "Relatório exportado com sucesso",
            "format": format,
            "download_url": f"/api/v1/financial/reports/export/file?format={format}",
            "filename": f"relatorio_financeiro_{format}.{format}"
        }
    except Exception as e:
        logger.error(f"Erro ao exportar relatório: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )














