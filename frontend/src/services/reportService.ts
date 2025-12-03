// ===========================================
// SERVIÇO RELATÓRIOS - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface ReportFilters {
  startDate?: string
  endDate?: string
  status?: string
  category?: string
  clientName?: string
  assignedTo?: string
  priority?: string
}

export interface ProcessReport {
  totalProcesses: number
  activeProcesses: number
  completedProcesses: number
  pausedProcesses: number
  totalValue: number
  averageValue: number
  averageDuration: number
  completionRate: number
}

export interface TaskReport {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  urgentTasks: number
  averageCompletionTime: number
  completionRate: number
}

export interface FinancialReport {
  totalRevenue: number
  monthlyRevenue: number
  growthRate: number
  averageTicket: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}

export interface PerformanceReport {
  processEfficiency: number
  taskEfficiency: number
  teamPerformance: number
  clientSatisfaction: number
  averageResponseTime: number
  productivityScore: number
}

export interface ClientReport {
  totalClients: number
  activeClients: number
  newClients: number
  topClients: Array<{
    name: string
    totalValue: number
    processCount: number
    lastActivity: string
  }>
  clientRetention: number
}

export const reportService = {
  // Buscar relatório de processos
  async getProcessReport(filters?: ReportFilters): Promise<ProcessReport> {
    try {
      const response = await apiService.get('/reports/processes', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de processos:', error)
      throw error
    }
  },

  // Buscar relatório de tarefas
  async getTaskReport(filters?: ReportFilters): Promise<TaskReport> {
    try {
      const response = await apiService.get('/reports/tasks', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de tarefas:', error)
      throw error
    }
  },

  // Buscar relatório financeiro
  async getFinancialReport(filters?: ReportFilters): Promise<FinancialReport> {
    try {
      const response = await apiService.get('/reports/financial', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório financeiro:', error)
      throw error
    }
  },

  // Buscar relatório de performance
  async getPerformanceReport(filters?: ReportFilters): Promise<PerformanceReport> {
    try {
      const response = await apiService.get('/reports/performance', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de performance:', error)
      throw error
    }
  },

  // Buscar relatório de clientes
  async getClientReport(filters?: ReportFilters): Promise<ClientReport> {
    try {
      const response = await apiService.get('/reports/clients', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de clientes:', error)
      throw error
    }
  },

  // Buscar relatório consolidado
  async getConsolidatedReport(filters?: ReportFilters): Promise<{
    processes: ProcessReport
    tasks: TaskReport
    financial: FinancialReport
    performance: PerformanceReport
    clients: ClientReport
  }> {
    try {
      const response = await apiService.get('/reports/consolidated', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório consolidado:', error)
      throw error
    }
  },

  // Buscar dados para gráficos
  async getChartData(type: 'processes' | 'tasks' | 'financial' | 'performance', filters?: ReportFilters): Promise<any> {
    try {
      const response = await apiService.get(`/reports/charts/${type}`, {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar dados de gráficos:', error)
      throw error
    }
  },

  // Exportar relatório
  async exportReport(type: string, format: 'pdf' | 'excel' | 'csv', filters?: ReportFilters): Promise<Blob> {
    try {
      const response = await apiService.get(`/reports/export/${type}`, {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  },

  // Buscar relatório de produtividade da equipe
  async getTeamProductivityReport(filters?: ReportFilters): Promise<{
    teamMembers: Array<{
      name: string
      tasksCompleted: number
      processesHandled: number
      averageCompletionTime: number
      productivityScore: number
    }>
    teamAverage: {
      tasksCompleted: number
      processesHandled: number
      averageCompletionTime: number
      productivityScore: number
    }
  }> {
    try {
      const response = await apiService.get('/reports/team-productivity', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de produtividade:', error)
      throw error
    }
  },

  // Buscar relatório de prazos
  async getDeadlineReport(filters?: ReportFilters): Promise<{
    upcomingDeadlines: Array<{
      id: number
      title: string
      dueDate: string
      daysRemaining: number
      priority: string
      assignedTo: string
    }>
    overdueItems: Array<{
      id: number
      title: string
      dueDate: string
      daysOverdue: number
      priority: string
      assignedTo: string
    }>
    deadlineStats: {
      totalUpcoming: number
      totalOverdue: number
      averageDaysRemaining: number
      averageDaysOverdue: number
    }
  }> {
    try {
      const response = await apiService.get('/reports/deadlines', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar relatório de prazos:', error)
      throw error
    }
  }
}















