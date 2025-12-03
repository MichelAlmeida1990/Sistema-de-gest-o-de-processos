// ===========================================
// SERVIÇO FINANCEIRO - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface FinancialData {
  totalRevenue: number
  monthlyRevenue: number
  growthRate: number
  averageTicket: number
  totalClients: number
  activeClients: number
  pendingPayments: number
  paidPayments: number
  overduePayments: number
}

export interface RevenueByArea {
  area: string
  revenue: number
  percentage: number
  cases: number
}

export interface MonthlyTrend {
  month: string
  revenue: number
  cases: number
}

export interface TopClient {
  name: string
  revenue: number
  cases: number
  lastPayment: string
}

export interface FinancialInsight {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  value: string
  icon: string
}

export interface ProcessFinancial {
  id: number
  title: string
  processNumber: string
  clientName: string
  estimatedValue: number
  actualValue: number
  status: string
  category: string
  createdAt: string
  updatedAt: string
}

export const financialService = {
  // Buscar dados financeiros gerais
  async getFinancialData(): Promise<FinancialData> {
    try {
      const response = await apiService.get('/financial/summary')
      return response
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error)
      throw error
    }
  },

  // Buscar receitas por área jurídica
  async getRevenueByArea(): Promise<RevenueByArea[]> {
    try {
      const response = await apiService.get('/financial/revenue-by-area')
      return response
    } catch (error) {
      console.error('Erro ao buscar receitas por área:', error)
      throw error
    }
  },

  // Buscar tendências mensais
  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    try {
      const response = await apiService.get('/financial/monthly-trends')
      return response
    } catch (error) {
      console.error('Erro ao buscar tendências mensais:', error)
      throw error
    }
  },

  // Buscar top clientes
  async getTopClients(): Promise<TopClient[]> {
    try {
      const response = await apiService.get('/financial/top-clients')
      return response
    } catch (error) {
      console.error('Erro ao buscar top clientes:', error)
      throw error
    }
  },

  // Buscar insights financeiros
  async getFinancialInsights(): Promise<FinancialInsight[]> {
    try {
      const response = await apiService.get('/financial/insights')
      return response
    } catch (error) {
      console.error('Erro ao buscar insights financeiros:', error)
      throw error
    }
  },

  // Buscar processos com dados financeiros
  async getProcessesFinancial(): Promise<ProcessFinancial[]> {
    try {
      const response = await apiService.get('/financial/processes')
      return response
    } catch (error) {
      console.error('Erro ao buscar processos financeiros:', error)
      throw error
    }
  },

  // Buscar pagamentos
  async getPayments(params?: {
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{
    payments: any[]
    total: number
    summary: {
      totalAmount: number
      paidAmount: number
      pendingAmount: number
    }
  }> {
    try {
      const response = await apiService.get('/financial/payments', { params })
      return response
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error)
      throw error
    }
  },

  // Atualizar valor de processo
  async updateProcessValue(processId: number, value: number, type: 'estimated' | 'actual'): Promise<void> {
    try {
      await apiService.put(`/financial/processes/${processId}/value`, {
        value,
        type
      })
    } catch (error) {
      console.error('Erro ao atualizar valor do processo:', error)
      throw error
    }
  },

  // Registrar pagamento
  async registerPayment(data: {
    processId: number
    amount: number
    description: string
    paymentDate: string
    method: string
  }): Promise<void> {
    try {
      await apiService.post('/financial/payments', data)
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      throw error
    }
  },

  // Exportar relatório financeiro
  async exportFinancialReport(format: 'csv' | 'pdf', params?: {
    startDate?: string
    endDate?: string
    area?: string
  }): Promise<Blob> {
    try {
      const response = await apiService.get('/financial/export', {
        params: { format, ...params },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  }
}
