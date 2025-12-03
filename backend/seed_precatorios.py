#!/usr/bin/env python3
# ===========================================
# SCRIPT PARA POPULAR PRECATÓRIOS COM DADOS DE EXEMPLO
# ===========================================

import sys
import os
from datetime import datetime, timedelta
import random

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.precatorio import Precatorio, PrecatórioNatureza, PrecatórioStatus
from app.models.process import Process

def create_precatorios_data():
    """Criar dados de exemplo de precatórios."""
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem precatórios
        if db.query(Precatorio).count() > 0:
            print("⚠️  Precatórios já existem no banco.")
            resposta = input("Deseja adicionar mais precatórios? (s/n): ")
            if resposta.lower() != 's':
                print("Operação cancelada.")
                return
        
        print("📋 Criando precatórios de exemplo...")
        
        # Buscar processos existentes para vincular
        processes = db.query(Process).limit(5).all()
        
        # Dados de exemplo de precatórios
        precatorios_data = [
            {
                "numero": "PREC-2024-001",
                "processo_origem": "1001234-56.2024.8.26.0001",
                "tribunal": "TRT-2ª Região",
                "ente_devedor": "União",
                "natureza": PrecatórioNatureza.ALIMENTAR,
                "status": PrecatórioStatus.INSCRITO_ORCAMENTO,
                "valor_origem": 150000.00,
                "data_inscricao": datetime(2020, 1, 15),
                "ano_orcamento": 2024,
                "cliente_nome": "João Silva Santos",
                "cliente_documento": "123.456.789-00",
                "observacoes": "Precatório alimentar decorrente de ação trabalhista. Processo transitado em julgado em 2019."
            },
            {
                "numero": "PREC-2024-002",
                "processo_origem": "2001234-56.2024.8.26.0002",
                "tribunal": "TJSP",
                "ente_devedor": "Estado de São Paulo",
                "natureza": PrecatórioNatureza.COMUM,
                "status": PrecatórioStatus.AGUARDANDO_PAGAMENTO,
                "valor_origem": 85000.00,
                "data_inscricao": datetime(2019, 6, 20),
                "ano_orcamento": 2023,
                "cliente_nome": "Maria Santos Lima",
                "cliente_documento": "987.654.321-00",
                "observacoes": "Precatório comum decorrente de ação de indenização. Inscrito no orçamento de 2023."
            },
            {
                "numero": "PREC-2024-003",
                "processo_origem": "3001234-56.2024.8.26.0003",
                "tribunal": "TRF-3ª Região",
                "ente_devedor": "União",
                "natureza": PrecatórioNatureza.ALIMENTAR,
                "status": PrecatórioStatus.PAGO_PARCIAL,
                "valor_origem": 250000.00,
                "valor_atualizado": 320000.00,  # Já calculado
                "data_inscricao": datetime(2018, 3, 10),
                "ano_orcamento": 2022,
                "cliente_nome": "Carlos Lima Costa",
                "cliente_documento": "456.789.123-00",
                "observacoes": "Precatório alimentar. Recebeu pagamento parcial de R$ 150.000,00 em 2023. Restante aguardando pagamento."
            },
            {
                "numero": "PREC-2024-004",
                "processo_origem": "4001234-56.2024.8.26.0004",
                "tribunal": "TJMG",
                "ente_devedor": "Estado de Minas Gerais",
                "natureza": PrecatórioNatureza.COMUM,
                "status": PrecatórioStatus.AGUARDANDO_INSCRICAO,
                "valor_origem": 120000.00,
                "data_inscricao": datetime(2021, 11, 5),
                "ano_orcamento": None,
                "cliente_nome": "Ana Costa Silva",
                "cliente_documento": "789.123.456-00",
                "observacoes": "Aguardando inscrição no orçamento de 2025."
            },
            {
                "numero": "PREC-2024-005",
                "processo_origem": "5001234-56.2024.8.26.0005",
                "tribunal": "TRT-1ª Região",
                "ente_devedor": "União",
                "natureza": PrecatórioNatureza.ALIMENTAR,
                "status": PrecatórioStatus.PAGO,
                "valor_origem": 180000.00,
                "valor_atualizado": 220000.00,
                "data_inscricao": datetime(2017, 8, 22),
                "ano_orcamento": 2021,
                "cliente_nome": "Pedro Oliveira Santos",
                "cliente_documento": "321.654.987-00",
                "observacoes": "Precatório totalmente quitado em 2022."
            },
            {
                "numero": "PREC-2024-006",
                "processo_origem": "6001234-56.2024.8.26.0006",
                "tribunal": "TJRS",
                "ente_devedor": "Estado do Rio Grande do Sul",
                "natureza": PrecatórioNatureza.COMUM,
                "status": PrecatórioStatus.NEGOCIADO,
                "valor_origem": 95000.00,
                "valor_atualizado": 110000.00,
                "data_inscricao": datetime(2020, 9, 14),
                "ano_orcamento": 2023,
                "cliente_nome": "Roberto Almeida Mendes",
                "cliente_documento": "654.321.987-00",
                "observacoes": "Precatório negociado com desconto. Acordo aprovado em 2023."
            },
            {
                "numero": "PREC-2024-007",
                "processo_origem": None,
                "tribunal": "TJSP",
                "ente_devedor": "Município de São Paulo",
                "natureza": PrecatórioNatureza.ALIMENTAR,
                "status": PrecatórioStatus.INSCRITO_ORCAMENTO,
                "valor_origem": 320000.00,
                "data_inscricao": datetime(2019, 4, 30),
                "ano_orcamento": 2024,
                "cliente_nome": "Fernanda Souza Oliveira",
                "cliente_documento": "147.258.369-00",
                "observacoes": "Precatório alimentar de alto valor. Inscrito no orçamento de 2024."
            },
            {
                "numero": "PREC-2024-008",
                "processo_origem": None,
                "tribunal": "TRT-4ª Região",
                "ente_devedor": "União",
                "natureza": PrecatórioNatureza.COMUM,
                "status": PrecatórioStatus.AGUARDANDO_PAGAMENTO,
                "valor_origem": 75000.00,
                "data_inscricao": datetime(2020, 12, 10),
                "ano_orcamento": 2023,
                "cliente_nome": "Lucas Pereira Martins",
                "cliente_documento": "258.369.147-00",
                "observacoes": "Aguardando pagamento previsto para 2024."
            },
            {
                "numero": "PREC-2024-009",
                "processo_origem": None,
                "tribunal": "TJBA",
                "ente_devedor": "Estado da Bahia",
                "natureza": PrecatórioNatureza.ALIMENTAR,
                "status": PrecatórioStatus.AGUARDANDO_INSCRICAO,
                "valor_origem": 200000.00,
                "data_inscricao": datetime(2022, 2, 18),
                "ano_orcamento": None,
                "cliente_nome": "Juliana Rodrigues Alves",
                "cliente_documento": "369.147.258-00",
                "observacoes": "Processo recente. Aguardando inscrição no próximo orçamento."
            },
            {
                "numero": "PREC-2024-010",
                "processo_origem": None,
                "tribunal": "TRT-3ª Região",
                "ente_devedor": "União",
                "natureza": PrecatórioNatureza.COMUM,
                "status": PrecatórioStatus.INSCRITO_ORCAMENTO,
                "valor_origem": 135000.00,
                "data_inscricao": datetime(2021, 7, 25),
                "ano_orcamento": 2024,
                "cliente_nome": "Marcos Antonio Ferreira",
                "cliente_documento": "741.852.963-00",
                "observacoes": "Inscrito no orçamento de 2024. Pagamento previsto para segundo semestre."
            }
        ]
        
        precatorios = []
        for i, prec_data in enumerate(precatorios_data):
            # Vincular a um processo se disponível
            processo_id = None
            if processes and i < len(processes):
                processo_id = processes[i].id
            
            precatorio = Precatorio(
                **prec_data,
                processo_id=processo_id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180))
            )
            
            db.add(precatorio)
            precatorios.append(precatorio)
        
        db.commit()
        print(f"✅ Criados {len(precatorios)} precatórios de exemplo")
        
        print("\n📊 Resumo dos Precatórios criados:")
        print("-" * 80)
        for prec in precatorios:
            status_emoji = {
                PrecatórioStatus.AGUARDANDO_INSCRICAO: "⏳",
                PrecatórioStatus.INSCRITO_ORCAMENTO: "📋",
                PrecatórioStatus.AGUARDANDO_PAGAMENTO: "💰",
                PrecatórioStatus.PAGO_PARCIAL: "💵",
                PrecatórioStatus.PAGO: "✅",
                PrecatórioStatus.NEGOCIADO: "🤝"
            }
            natureza_emoji = "🍞" if prec.natureza == PrecatórioNatureza.ALIMENTAR else "📄"
            
            print(f"{status_emoji.get(prec.status, '📌')} {natureza_emoji} {prec.numero}")
            print(f"   Cliente: {prec.cliente_nome}")
            print(f"   Valor: R$ {prec.valor_origem:,.2f}")
            if prec.valor_atualizado:
                print(f"   Valor Atualizado: R$ {prec.valor_atualizado:,.2f}")
            print(f"   Ente Devedor: {prec.ente_devedor}")
            print(f"   Status: {prec.status.value}")
            print()
        
        print("\n💡 Dica: Use o botão 'Atualizar' na interface para calcular")
        print("   automaticamente o valor atualizado usando índices econômicos!")
        
    except Exception as e:
        print(f"❌ Erro ao criar precatórios: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    create_precatorios_data()




