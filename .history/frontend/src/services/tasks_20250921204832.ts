// ===========================================
// SERVIÇO DE TAREFAS
// ===========================================

import apiService from './api'

// ===========================================
// TIPOS
// ===========================================

export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  progress_percentage: number
  estimated_hours?: number
  actual_hours?: number
  category?: string
  tags?: string
  process_id?: number
  assigned_user_id?: number
  created_by_id: number
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  estimated_hours?: number
  category?: string
  tags?: string
  process_id?: number
  assigned_user_id?: number
}

export interface TaskUpdate {
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  progress_percentage?: number
  estimated_hours?: number
  actual_hours?: number
  category?: string
  tags?: string
  assigned_user_id?: number
}

export interface TaskList {
  tasks: Task[]
  total: number
  page: number
  per_page: number
}

export interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
  assigned_user_id?: number
  process_id?: number
  page?: number
  per_page?: number
}

// ===========================================
// SERVIÇO DE TAREFAS
// ===========================================

class TaskService {
  // ===========================================
  // CRUD OPERATIONS
  // ===========================================

  async getTasks(filters: TaskFilters = {}): Promise<TaskList> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      if (filters.assigned_user_id) params.append('assigned_user_id', String(filters.assigned_user_id))
      if (filters.process_id) params.append('process_id', String(filters.process_id))
      if (filters.page) params.append('skip', String((filters.page - 1) * (filters.per_page || 10)))
      if (filters.per_page) params.append('limit', String(filters.per_page))

      const response = await apiService.get<TaskList>(`/tasks?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar tarefas')
    }
  }

  async getMyTasks(filters: TaskFilters = {}): Promise<TaskList> {
    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('skip', String((filters.page - 1) * (filters.per_page || 10)))
      if (filters.per_page) params.append('limit', String(filters.per_page))

      const response = await apiService.get<TaskList>(`/tasks/my?${params.toString()}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar minhas tarefas')
    }
  }

  async getTask(id: number): Promise<Task> {
    try {
      const response = await apiService.get<Task>(`/tasks/${id}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar tarefa')
    }
  }

  async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      const response = await apiService.post<Task>('/tasks', taskData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao criar tarefa')
    }
  }

  async updateTask(id: number, taskData: TaskUpdate): Promise<Task> {
    try {
      const response = await apiService.put<Task>(`/tasks/${id}`, taskData)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao atualizar tarefa')
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await apiService.delete(`/tasks/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao deletar tarefa')
    }
  }

  // ===========================================
  // AÇÕES ESPECÍFICAS
  // ===========================================

  async completeTask(id: number): Promise<Task> {
    try {
      const response = await apiService.put<Task>(`/tasks/${id}`, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress_percentage: 100
      })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao completar tarefa')
    }
  }

  async updateProgress(id: number, percentage: number): Promise<Task> {
    try {
      const response = await apiService.put<Task>(`/tasks/${id}`, {
        progress_percentage: percentage,
        status: percentage === 100 ? 'completed' : 'in_progress',
        completed_at: percentage === 100 ? new Date().toISOString() : undefined
      })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao atualizar progresso')
    }
  }

  async assignTask(id: number, userId: number): Promise<Task> {
    try {
      const response = await apiService.put<Task>(`/tasks/${id}`, {
        assigned_user_id: userId,
        status: 'todo'
      })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao atribuir tarefa')
    }
  }

  // ===========================================
  // UTILITÁRIOS
  // ===========================================

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      todo: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
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
      todo: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red'
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

  isOverdue(task: Task): boolean {
    if (!task.due_date || task.status === 'completed') {
      return false
    }
    return new Date(task.due_date) < new Date()
  }

  getDaysUntilDue(task: Task): number {
    if (!task.due_date) {
      return 0
    }
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

export const taskService = new TaskService()
export default taskService







