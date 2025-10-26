// ===========================================
// SERVIÇO PROCESSOS - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface Process {
  id: number
  title: string
  description: string
  clientName: string
  status: string
  priority: string
  category: string
  estimatedValue: number
  actualValue: number
  startDate: string
  expectedEndDate: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  tags?: string[]
}

export interface ProcessFilters {
  status?: string
  priority?: string
  category?: string
  clientName?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface ProcessStats {
  total: number
  active: number
  completed: number
  paused: number
  overdue: number
  totalValue: number
  averageValue: number
}

export const processService = {
  // Buscar todos os processos
  async getProcesses(filters?: ProcessFilters, page: number = 1, limit: number = 20): Promise<{
    processes: Process[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const response = await apiService.get('/processes/', {
        params: { ...filters, page, limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar processos:', error)
      throw error
    }
  },

  // Buscar processo por ID
  async getProcessById(id: number): Promise<Process> {
    try {
      const response = await apiService.get(`/processes/${id}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar processo:', error)
      throw error
    }
  },

  // Criar novo processo
  async createProcess(processData: Partial<Process>): Promise<Process> {
    try {
      const response = await apiService.post('/processes/', processData)
      return response
    } catch (error) {
      console.error('Erro ao criar processo:', error)
      throw error
    }
  },

  // Atualizar processo
  async updateProcess(id: number, processData: Partial<Process>): Promise<Process> {
    try {
      const response = await apiService.put(`/processes/${id}`, processData)
      return response
    } catch (error) {
      console.error('Erro ao atualizar processo:', error)
      throw error
    }
  },

  // Deletar processo
  async deleteProcess(id: number): Promise<void> {
    try {
      // Usar endpoint de teste temporariamente
      await apiService.delete(`/processes/test/${id}`)
    } catch (error) {
      console.error('Erro ao deletar processo:', error)
      throw error
    }
  },

  // Buscar estatísticas de processos
  async getProcessStats(): Promise<ProcessStats> {
    try {
      const response = await apiService.get('/processes/stats')
      return response
    } catch (error) {
      console.error('Erro ao buscar estatísticas de processos:', error)
      throw error
    }
  },

  // Buscar processos por status
  async getProcessesByStatus(status: string): Promise<Process[]> {
    try {
      const response = await apiService.get('/processes/', {
        params: { status }
      })
      return response.processes
    } catch (error) {
      console.error('Erro ao buscar processos por status:', error)
      throw error
    }
  },

  // Buscar processos por cliente
  async getProcessesByClient(clientName: string): Promise<Process[]> {
    try {
      const response = await apiService.get('/processes/', {
        params: { clientName }
      })
      return response.processes
    } catch (error) {
      console.error('Erro ao buscar processos por cliente:', error)
      throw error
    }
  },

  // Buscar processos próximos do vencimento
  async getUpcomingDeadlines(days: number = 7): Promise<Process[]> {
    try {
      const response = await apiService.get('/processes/upcoming-deadlines', {
        params: { days }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar prazos próximos:', error)
      throw error
    }
  },

  // Buscar processos atrasados
  async getOverdueProcesses(): Promise<Process[]> {
    try {
      const response = await apiService.get('/processes/overdue')
      return response
    } catch (error) {
      console.error('Erro ao buscar processos atrasados:', error)
      throw error
    }
  },

  // Atualizar status do processo
  async updateProcessStatus(id: number, status: string): Promise<Process> {
    try {
      const response = await apiService.put(`/processes/${id}/status`, { status })
      return response
    } catch (error) {
      console.error('Erro ao atualizar status do processo:', error)
      throw error
    }
  },

  // Atribuir processo a usuário
  async assignProcess(id: number, userId: number): Promise<Process> {
    try {
      const response = await apiService.put(`/processes/${id}/assign`, { userId })
      return response
    } catch (error) {
      console.error('Erro ao atribuir processo:', error)
      throw error
    }
  },

  // Exportar processos
  async exportProcesses(format: 'csv' | 'pdf', filters?: ProcessFilters): Promise<Blob> {
    try {
      const response = await apiService.get('/processes/export', {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar processos:', error)
      throw error
    }
  }
}