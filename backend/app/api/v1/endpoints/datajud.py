# ===========================================
# ENDPOINTS DE INTEGRAÇÃO DATAJUD
# ===========================================

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from datetime import datetime

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.datajud import datajud_service

router = APIRouter()


@router.get("/status")
async def get_datajud_status():
    """Verificar status da API DataJud."""
    try:
        status_info = await datajud_service.check_api_status()
        return status_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao verificar status da API DataJud: {str(e)}"
        )


@router.get("/process/{process_number}")
async def search_process(
    process_number: str
):
    """Buscar processo pelo número na API DataJud."""
    try:
        # Validar número do processo
        if not datajud_service.validate_process_number(process_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de processo inválido"
            )

        process_data = await datajud_service.search_process_by_number(
            process_number
        )

        if not process_data:
            return {
                "success": False,
                "message": "Processo não encontrado na base DataJud",
                "process_number": process_number,
                "formatted_number": datajud_service.format_process_number(
                    process_number
                ),
                "suggestion": (
                    "Verifique se o número está correto ou se o processo "
                    "existe na base DataJud"
                )
            }

        return {
            "success": True,
            "data": process_data,
            "formatted_number": datajud_service.format_process_number(
                process_number
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processo: {str(e)}"
        )


@router.get("/process/{process_number}/movements")
async def get_process_movements(
    process_number: str,
    start_date: Optional[datetime] = Query(
        None, description="Data inicial para busca de movimentações"
    ),
    current_user: User = Depends(get_current_user)
):
    """Obter movimentações de um processo."""
    try:
        if not datajud_service.validate_process_number(process_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de processo inválido"
            )

        movements = await datajud_service.get_process_movements(
            process_number, start_date
        )

        return {
            "success": True,
            "process_number": datajud_service.format_process_number(
                process_number
            ),
            "movements": movements,
            "total": len(movements)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar movimentações: {str(e)}"
        )


@router.get("/search/document/{document}")
async def search_processes_by_document(
    document: str,
    current_user: User = Depends(get_current_user)
):
    """Buscar processos por CPF/CNPJ."""
    try:
        # Validar documento básico
        clean_doc = ''.join(filter(str.isdigit, document))
        if len(clean_doc) not in [11, 14]:  # CPF ou CNPJ
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Documento deve ser um CPF (11 dígitos) ou "
                    "CNPJ (14 dígitos)"
                )
            )

        processes = await datajud_service.search_processes_by_cpf_cnpj(
            document
        )

        return {
            "success": True,
            "document": document,
            "processes": processes,
            "total": len(processes)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos por documento: {str(e)}"
        )


@router.get("/tribunal/{tribunal_code}")
async def get_tribunal_info(
    tribunal_code: str,
    current_user: User = Depends(get_current_user)
):
    """Obter informações de um tribunal."""
    try:
        tribunal_info = await datajud_service.get_tribunal_info(tribunal_code)

        if not tribunal_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tribunal não encontrado"
            )

        return {
            "success": True,
            "tribunal": tribunal_info
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tribunal: {str(e)}"
        )


@router.get("/tables/classes")
async def get_process_classes():
    """Obter tabela de classes processuais."""
    try:
        classes = await datajud_service.get_process_classes()

        return {
            "success": True,
            "classes": classes,
            "total": len(classes)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar classes processuais: {str(e)}"
        )


@router.get("/tables/subjects")
async def get_process_subjects():
    """Obter tabela de assuntos processuais."""
    try:
        subjects = await datajud_service.get_process_subjects()

        return {
            "success": True,
            "subjects": subjects,
            "total": len(subjects)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar assuntos processuais: {str(e)}"
        )


@router.post("/validate/process-number")
async def validate_process_number(
    request: dict
):
    """Validar número de processo pelo algoritmo CNJ."""
    try:
        process_number = request.get("process_number", "")
        is_valid = datajud_service.validate_process_number(process_number)
        formatted = datajud_service.format_process_number(
                process_number
            ) if is_valid else None

        return {
            "process_number": process_number,
            "is_valid": is_valid,
            "formatted": formatted,
            "message": "Número válido" if is_valid else "Número inválido"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar número: {str(e)}"
        )


@router.get("/process/{process_number}/movements/detailed")
async def get_detailed_movements(
    process_number: str
):
    """Obter movimentações detalhadas usando API DataJud real."""
    try:
        if not datajud_service.validate_process_number(process_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de processo inválido"
            )

        movements = await datajud_service.consultar_movimentacoes_processo(
            process_number
        )

        return {
            "success": True,
            "process_number": datajud_service.format_process_number(
                process_number
            ),
            "movements": movements,
            "total": len(movements)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar movimentações detalhadas: {str(e)}"
        )


@router.get("/search/class/{classe_processual}")
async def search_processes_by_class(
    classe_processual: str,
    tribunal: Optional[str] = Query(
        None, description="Sigla do tribunal (opcional)"
    )
):
    """Buscar processos por classe processual."""
    try:
        tribunal_code = tribunal or ""
        processes = await datajud_service.consultar_processos_por_classe(
            classe_processual, tribunal_code
        )

        return {
            "success": True,
            "classe_processual": classe_processual,
            "tribunal": tribunal,
            "processes": processes,
            "total": len(processes)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos por classe: {str(e)}"
        )


@router.get("/statistics/tribunal/{tribunal}")
async def get_tribunal_statistics(
    tribunal: str
):
    """Obter estatísticas de um tribunal."""
    try:
        stats = await datajud_service.consultar_estatisticas_tribunal(tribunal)

        return {
            "success": True,
            "statistics": stats
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas do tribunal: {str(e)}"
        )


@router.get("/tribunals")
async def get_all_tribunals():
    """Obter lista completa de tribunais disponíveis."""
    try:
        tribunals = await datajud_service.consultar_tribunais()

        return {
            "success": True,
            "tribunals": tribunals,
            "total": len(tribunals)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tribunais: {str(e)}"
        )


@router.get("/search/document/{document}/detailed")
async def search_processes_by_document_detailed(
    document: str
):
    """Buscar processos por CPF/CNPJ usando API DataJud real."""
    try:
        # Validar documento básico
        clean_doc = ''.join(filter(str.isdigit, document))
        if len(clean_doc) not in [11, 14]:  # CPF ou CNPJ
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Documento deve ser um CPF (11 dígitos) ou "
                    "CNPJ (14 dígitos)"
                )
            )

        processes = await datajud_service.consultar_processos_por_cpf_cnpj(
            document
        )

        return {
            "success": True,
            "document": document,
            "document_type": "CPF" if len(clean_doc) == 11 else "CNPJ",
            "processes": processes,
            "total": len(processes)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar processos por documento: {str(e)}"
        )


@router.get("/api-info")
async def get_api_info():
    """Obter informações sobre a API DataJud e suas capacidades."""
    try:
        return {
            "success": True,
            "api_info": {
                "name": "API Pública DataJud CNJ",
                "description": (
                    "API oficial do Conselho Nacional de Justiça para "
                    "consulta de metadados de processos judiciais"
                ),
                "base_url": datajud_service.BASE_URL,
                "version": "1.0",
                "authentication": "API Key",
                "rate_limit": "60 requests/minute",
                "endpoints": [
                    "GET /status - Status da API",
                    "GET /process/{number} - Consultar processo por número",
                    "GET /process/{number}/movements/detailed - "
                    "Movimentações detalhadas",
                    "GET /search/document/{document}/detailed - "
                    "Buscar por CPF/CNPJ",
                    "GET /search/class/{class} - Buscar por classe processual",
                    "GET /statistics/tribunal/{tribunal} - "
                    "Estatísticas do tribunal",
                    "GET /tribunals - Lista de tribunais",
                    "GET /tables/classes - Classes processuais",
                    "GET /tables/subjects - Assuntos processuais",
                    "POST /validate/process-number - Validar número CNJ"
                ],
                "supported_tribunals": [
                    "TRF1-TRF5 (Tribunais Regionais Federais)",
                    "TRT1-TRT24 (Tribunais Regionais do Trabalho)",
                    "TJSP, TJRJ, TJMG, etc. (Tribunais de Justiça Estaduais)",
                    "STF, STJ, TST (Tribunais Superiores)",
                    "CNJ (Conselho Nacional de Justiça)"
                ],
                "data_types": [
                    "Metadados de processos",
                    "Movimentações processuais",
                    "Informações das partes",
                    "Dados dos tribunais",
                    "Classes e assuntos processuais"
                ],
                "limitations": [
                    "Não permite consulta a processos em segredo de justiça",
                    "Apenas metadados, não documentos completos",
                    "Rate limiting aplicado",
                    "Requer API key para acesso"
                ],
                "documentation": (
                    "https://datajud-wiki.cnj.jus.br/api-publica/"
                ),
                "api_key_info": (
                    "https://www.cnj.jus.br/sistemas/datajud/api-publica/"
                )
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter informações da API: {str(e)}"
        )
