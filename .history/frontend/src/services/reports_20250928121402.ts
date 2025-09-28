// ===========================================
// SERVIÇO DE RELATÓRIOS
// ===========================================

import apiService from './api'

// ===========================================
// TIPOS
// ===========================================

export interface DashboardStats {
  processes: {
    total: number
    active: number
    by_status: Array<{
      status: string
      count: number
    }>
  }
  tasks: {
    total: number
    completed: number
    pending: number
    by_status: Array<{
      status: string
      count: number
    }>
  }
  files: {
    total: number
  }
  recent: {
    tasks_30_days: number
    processes_30_days: number
  }
}

export interface ProcessAnalytics {
  total: number
  monthly: Array<{
    year: number
    month: number
    count: number
  }>
  by_client: Array<{
    client: string
    count: number
  }>
}

export interface TaskAnalytics {
  total: number
  by_priority: Array<{
    priority: string
    count: number
  }>
  by_category: Array<{
    category: string
    count: number
  }>
  avg_completion_time_seconds: number
}

export interface AnalyticsFilters {
  start_date?: string
  end_date?: string
}

// ===========================================
// SERVIÇO DE RELATÓRIOS
// ===========================================

class ReportService {
  // ===========================================
  // DASHBOARD
  // ===========================================

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/reports/dashboard')
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar estatísticas do dashboard')
    }
  }

  // ===========================================
  // ANÁLISES
  // ===========================================

  async getProcessAnalytics(filters: AnalyticsFilters = {}): Promise<ProcessAnalytics> {
    try {
      const params = new URLSearchParams()
      
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await apiService.get<ProcessAnalytics>(`/reports/processes/analytics?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar análise de processos')
    }
  }

  async getTaskAnalytics(filters: AnalyticsFilters = {}): Promise<TaskAnalytics> {
    try {
      const params = new URLSearchParams()
      
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await apiService.get<TaskAnalytics>(`/reports/tasks/analytics?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar análise de tarefas')
    }
  }

  // ===========================================
  // UTILITÁRIOS
  // ===========================================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  }

  formatMonth(year: number, month: number): string {
    const date = new Date(year, month - 1)
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      archived: 'Arquivado',
      completed: 'Concluído',
      todo: 'Pendente',
      in_progress: 'Em Andamento',
      cancelled: 'Cancelada'
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
      active: '#52c41a',
      inactive: '#faad14',
      archived: '#8c8c8c',
      completed: '#1890ff',
      todo: '#faad14',
      in_progress: '#1890ff',
      cancelled: '#ff4d4f'
    }
    return colors[status] || '#d9d9d9'
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: '#52c41a',
      medium: '#1890ff',
      high: '#faad14',
      urgent: '#ff4d4f'
    }
    return colors[priority] || '#d9d9d9'
  }

  // ===========================================
  // CÁLCULOS
  // ===========================================

  calculateCompletionRate(completed: number, total: number): number {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  getTopPerformers(data: Array<{ name: string; value: number }>, limit: number = 5): Array<{ name: string; value: number }> {
    return data
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }

  getRecentTrend(data: Array<{ date: string; value: number }>, days: number = 7): Array<{ date: string; value: number }> {
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return sortedData.slice(-days)
  }
}

export const reportService = new ReportService()
export default reportService











