// ===========================================
// SERVIÇO DASHBOARD - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface DashboardStats {
  totalProcesses: number
  activeProcesses: number
  completedTasks: number
  averageTime: number
  totalRevenue: number
  pendingTasks: number
  overdueTasks: number
  teamMembers: number
}

export interface RecentActivity {
  id: number
  type: 'process' | 'task' | 'payment' | 'notification'
  title: string
  description: string
  user: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export interface ProcessSummary {
  id: number
  title: string
  clientName: string
  status: string
  priority: string
  value: number
  createdAt: string
  updatedAt: string
}

export interface TaskSummary {
  id: number
  title: string
  processTitle: string
  status: string
  priority: string
  dueDate: string
  assignedTo: string
  createdAt: string
}

export const dashboardService = {
  // Buscar estatísticas gerais do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get('/dashboard/stats')
      return response
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error)
      throw error
    }
  },

  // Buscar atividades recentes
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get('/dashboard/recent-activity', {
        params: { limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      throw error
    }
  },

  // Buscar resumo de processos
  async getProcessSummary(limit: number = 5): Promise<ProcessSummary[]> {
    try {
      const response = await apiService.get('/dashboard/processes', {
        params: { limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar resumo de processos:', error)
      throw error
    }
  },

  // Buscar resumo de tarefas
  async getTaskSummary(limit: number = 5): Promise<TaskSummary[]> {
    try {
      const response = await apiService.get('/dashboard/tasks', {
        params: { limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar resumo de tarefas:', error)
      throw error
    }
  },

  // Buscar métricas de performance
  async getPerformanceMetrics(): Promise<{
    processCompletionRate: number
    taskCompletionRate: number
    averageProcessTime: number
    averageTaskTime: number
    revenueGrowth: number
    clientSatisfaction: number
  }> {
    try {
      const response = await apiService.get('/dashboard/performance')
      return response
    } catch (error) {
      console.error('Erro ao buscar métricas de performance:', error)
      throw error
    }
  },

  // Buscar alertas e notificações
  async getAlerts(): Promise<{
    urgent: number
    warnings: number
    info: number
    total: number
  }> {
    try {
      const response = await apiService.get('/dashboard/alerts')
      return response
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
      throw error
    }
  }
}

