// ===========================================
// SERVIÇO TAREFAS - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  processId?: number
  processTitle?: string
  assignedTo?: string
  assignedUserId?: number
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
}

export interface TaskFilters {
  status?: string
  priority?: string
  assignedTo?: string
  processId?: number
  dueDate?: string
  search?: string
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  completed: number
  overdue: number
  urgent: number
  averageCompletionTime: number
}

export const taskService = {
  // Buscar todas as tarefas
  async getTasks(filters?: TaskFilters, page: number = 1, limit: number = 20): Promise<{
    tasks: Task[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const response = await apiService.get('/tasks', {
        params: { ...filters, page, limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      throw error
    }
  },

  // Buscar tarefa por ID
  async getTaskById(id: number): Promise<Task> {
    try {
      const response = await apiService.get(`/tasks/${id}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error)
      throw error
    }
  },

  // Criar nova tarefa
  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await apiService.post('/tasks', taskData)
      return response
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      throw error
    }
  },

  // Atualizar tarefa
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await apiService.put(`/tasks/${id}`, taskData)
      return response
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      throw error
    }
  },

  // Deletar tarefa
  async deleteTask(id: number): Promise<void> {
    try {
      await apiService.delete(`/tasks/${id}`)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      throw error
    }
  },

  // Buscar estatísticas de tarefas
  async getTaskStats(): Promise<TaskStats> {
    try {
      const response = await apiService.get('/tasks/stats')
      return response
    } catch (error) {
      console.error('Erro ao buscar estatísticas de tarefas:', error)
      throw error
    }
  },

  // Buscar tarefas por status
  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const response = await apiService.get('/tasks', {
        params: { status }
      })
      return response.tasks
    } catch (error) {
      console.error('Erro ao buscar tarefas por status:', error)
      throw error
    }
  },

  // Buscar tarefas por usuário
  async getTasksByUser(userId: number): Promise<Task[]> {
    try {
      const response = await apiService.get('/tasks', {
        params: { assignedTo: userId }
      })
      return response.tasks
    } catch (error) {
      console.error('Erro ao buscar tarefas por usuário:', error)
      throw error
    }
  },

  // Buscar tarefas próximas do vencimento
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    try {
      const response = await apiService.get('/tasks/upcoming', {
        params: { days }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar tarefas próximas:', error)
      throw error
    }
  },

  // Buscar tarefas atrasadas
  async getOverdueTasks(): Promise<Task[]> {
    try {
      const response = await apiService.get('/tasks/overdue')
      return response
    } catch (error) {
      console.error('Erro ao buscar tarefas atrasadas:', error)
      throw error
    }
  },

  // Atualizar status da tarefa
  async updateTaskStatus(id: number, status: string): Promise<Task> {
    try {
      const response = await apiService.put(`/tasks/${id}/status`, { status })
      return response
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error)
      throw error
    }
  },

  // Atribuir tarefa a usuário
  async assignTask(id: number, userId: number): Promise<Task> {
    try {
      const response = await apiService.put(`/tasks/${id}/assign`, { userId })
      return response
    } catch (error) {
      console.error('Erro ao atribuir tarefa:', error)
      throw error
    }
  },

  // Marcar tarefa como concluída
  async completeTask(id: number, actualHours?: number): Promise<Task> {
    try {
      const response = await apiService.put(`/tasks/${id}/complete`, { actualHours })
      return response
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error)
      throw error
    }
  },

  // Buscar tarefas urgentes
  async getUrgentTasks(): Promise<Task[]> {
    try {
      const response = await apiService.get('/tasks/urgent')
      return response
    } catch (error) {
      console.error('Erro ao buscar tarefas urgentes:', error)
      throw error
    }
  },

  // Exportar tarefas
  async exportTasks(format: 'csv' | 'pdf', filters?: TaskFilters): Promise<Blob> {
    try {
      const response = await apiService.get('/tasks/export', {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar tarefas:', error)
      throw error
    }
  }
}