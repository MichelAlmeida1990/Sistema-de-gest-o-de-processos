# 📊 Dados de Exemplo Criados

## ✅ Status

**Dados ilusórios criados com sucesso!**

---

## 📋 Precatórios Criados (10 registros)

### Lista de Precatórios:

1. **PREC-2024-001** 🍞 Alimentar
   - Cliente: João Silva Santos
   - Valor: R$ 150.000,00
   - Ente Devedor: União
   - Status: Inscrito em Orçamento
   - Data Inscrição: 15/01/2020

2. **PREC-2024-002** 📄 Comum
   - Cliente: Maria Santos Lima
   - Valor: R$ 85.000,00
   - Ente Devedor: Estado de São Paulo
   - Status: Aguardando Pagamento
   - Data Inscrição: 20/06/2019

3. **PREC-2024-003** 🍞 Alimentar
   - Cliente: Carlos Lima Costa
   - Valor: R$ 250.000,00
   - Valor Atualizado: R$ 320.000,00 ✅
   - Ente Devedor: União
   - Status: Pago Parcial
   - Data Inscrição: 10/03/2018

4. **PREC-2024-004** 📄 Comum
   - Cliente: Ana Costa Silva
   - Valor: R$ 120.000,00
   - Ente Devedor: Estado de Minas Gerais
   - Status: Aguardando Inscrição
   - Data Inscrição: 05/11/2021

5. **PREC-2024-005** 🍞 Alimentar
   - Cliente: Pedro Oliveira Santos
   - Valor: R$ 180.000,00
   - Valor Atualizado: R$ 220.000,00 ✅
   - Ente Devedor: União
   - Status: Pago
   - Data Inscrição: 22/08/2017

6. **PREC-2024-006** 📄 Comum
   - Cliente: Roberto Almeida Mendes
   - Valor: R$ 95.000,00
   - Valor Atualizado: R$ 110.000,00 ✅
   - Ente Devedor: Estado do Rio Grande do Sul
   - Status: Negociado
   - Data Inscrição: 14/09/2020

7. **PREC-2024-007** 🍞 Alimentar
   - Cliente: Fernanda Souza Oliveira
   - Valor: R$ 320.000,00
   - Ente Devedor: Município de São Paulo
   - Status: Inscrito em Orçamento
   - Data Inscrição: 30/04/2019

8. **PREC-2024-008** 📄 Comum
   - Cliente: Lucas Pereira Martins
   - Valor: R$ 75.000,00
   - Ente Devedor: União
   - Status: Aguardando Pagamento
   - Data Inscrição: 10/12/2020

9. **PREC-2024-009** 🍞 Alimentar
   - Cliente: Juliana Rodrigues Alves
   - Valor: R$ 200.000,00
   - Ente Devedor: Estado da Bahia
   - Status: Aguardando Inscrição
   - Data Inscrição: 18/02/2022

10. **PREC-2024-010** 📄 Comum
    - Cliente: Marcos Antonio Ferreira
    - Valor: R$ 135.000,00
    - Ente Devedor: União
    - Status: Inscrito em Orçamento
    - Data Inscrição: 25/07/2021

---

## 🎯 Como Visualizar na Interface

### 1. Acesse a página de Precatórios:
```
http://localhost:3002/precatorios
```

### 2. Você verá:
- ✅ Lista completa de 10 precatórios
- ✅ Valores de origem e atualizados
- ✅ Status de cada precatório
- ✅ Filtros por ente devedor, status, natureza
- ✅ Botão "Atualizar" para calcular valores automaticamente

### 3. Teste o Cálculo Automático:
1. Clique no botão **"Atualizar"** em qualquer precatório
2. O sistema calculará automaticamente usando IPCA-E
3. O valor atualizado será salvo automaticamente
4. Um modal mostrará os detalhes do cálculo

---

## 📊 Estatísticas dos Dados

- **Total de Precatórios:** 10
- **Alimentares:** 5 (50%)
- **Comuns:** 5 (50%)
- **Com Valor Atualizado:** 3 (30%)
- **Aguardando Cálculo:** 7 (70%)

### Por Status:
- ⏳ Aguardando Inscrição: 2
- 📋 Inscrito em Orçamento: 3
- 💰 Aguardando Pagamento: 2
- 💵 Pago Parcial: 1
- ✅ Pago: 1
- 🤝 Negociado: 1

### Por Ente Devedor:
- União: 5 precatórios
- Estados: 4 precatórios
- Municípios: 1 precatório

---

## 💡 Dicas de Uso

### Testar Cálculo de Atualização:
1. Escolha um precatório sem valor atualizado
2. Clique no botão **"Atualizar"**
3. O sistema consultará a API do Banco Central
4. Calculará usando IPCA-E desde a data de inscrição
5. Mostrará o resultado em um modal

### Exemplos para Testar:
- **PREC-2024-001**: Data de 2020 - mostrará boa atualização
- **PREC-2024-004**: Data de 2021 - atualização moderada
- **PREC-2024-009**: Data de 2022 - atualização recente

---

## 🔄 Recriar Dados

Se quiser recriar os dados:

```bash
cd backend
python seed_precatorios.py
```

**Nota:** O script pergunta se deseja adicionar mais precatórios se já existirem.

---

## 📈 Próximos Passos

1. ✅ Acesse a interface: `http://localhost:3002/precatorios`
2. ✅ Visualize os precatórios criados
3. ✅ Teste o cálculo de atualização
4. ✅ Explore filtros e buscas
5. ✅ Crie novos precatórios manualmente

---

**🎉 Dados prontos para visualização!**




