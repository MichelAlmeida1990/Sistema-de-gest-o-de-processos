// ===========================================
// SERVIÇO DE PROCESSOS
// ===========================================

import apiService from './api'

// ===========================================
// TIPOS
// ===========================================

export interface Process {
  id: number
  title: string
  description?: string
  process_number: string
  client_name: string
  client_document?: string
  client_contact?: string
  status: 'active' | 'inactive' | 'archived' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_value?: number
  actual_value?: number
  start_date?: string
  end_date?: string
  category?: string
  tags?: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface ProcessCreate {
  title: string
  description?: string
  process_number: string
  client_name: string
  client_document?: string
  client_contact?: string
  status?: 'active' | 'inactive' | 'archived' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimated_value?: number
  actual_value?: number
  start_date?: string
  end_date?: string
  category?: string
  tags?: string
}

export interface ProcessUpdate {
  title?: string
  description?: string
  process_number?: string
  client_name?: string
  client_document?: string
  client_contact?: string
  status?: 'active' | 'inactive' | 'archived' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimated_value?: number
  actual_value?: number
  start_date?: string
  end_date?: string
  category?: string
  tags?: string
}

export interface ProcessList {
  processes: Process[]
  total: number
  page: number
  per_page: number
}

export interface ProcessFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
  page?: number
  per_page?: number
}

// ===========================================
// SERVIÇO DE PROCESSOS
// ===========================================

class ProcessService {
  // ===========================================
  // CRUD OPERATIONS
  // ===========================================

  async getProcesses(filters: ProcessFilters = {}): Promise<ProcessList> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      if (filters.page) params.append('skip', String((filters.page - 1) * (filters.per_page || 10)))
      if (filters.per_page) params.append('limit', String(filters.per_page))

      const response = await apiService.get<ProcessList>(`/processes?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar processos')
    }
  }

  async getMyProcesses(filters: ProcessFilters = {}): Promise<ProcessList> {
    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('skip', String((filters.page - 1) * (filters.per_page || 10)))
      if (filters.per_page) params.append('limit', String(filters.per_page))

      const response = await apiService.get<ProcessList>(`/processes/my?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar meus processos')
    }
  }

  async getProcess(id: number): Promise<Process> {
    try {
      const response = await apiService.get<Process>(`/processes/${id}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar processo')
    }
  }

  async createProcess(processData: ProcessCreate): Promise<Process> {
    try {
      const response = await apiService.post<Process>('/processes', processData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao criar processo')
    }
  }

  async updateProcess(id: number, processData: ProcessUpdate): Promise<Process> {
    try {
      const response = await apiService.put<Process>(`/processes/${id}`, processData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao atualizar processo')
    }
  }

  async deleteProcess(id: number): Promise<void> {
    try {
      await apiService.delete(`/processes/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao deletar processo')
    }
  }

  // ===========================================
  // UTILITÁRIOS
  // ===========================================

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      archived: 'Arquivado',
      completed: 'Concluído'
    }
    return labels[status] || status
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    }
    return labels[priority] || priority
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'green',
      inactive: 'orange',
      archived: 'gray',
      completed: 'blue'
    }
    return colors[status] || 'default'
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    }
    return colors[priority] || 'default'
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  }

  formatDateTime(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
}

export const processService = new ProcessService()
export default processService













