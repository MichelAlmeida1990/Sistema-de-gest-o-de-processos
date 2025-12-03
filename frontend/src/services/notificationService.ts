// ===========================================
// SERVIÇO NOTIFICAÇÕES - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'unread' | 'read'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  readAt?: string
  userId: number
  processId?: number
  taskId?: number
  metadata?: any
}

export interface NotificationFilters {
  status?: string
  type?: string
  priority?: string
  userId?: number
  processId?: number
  taskId?: number
  startDate?: string
  endDate?: string
  search?: string
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  urgent: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

export const notificationService = {
  // Buscar todas as notificações
  async getNotifications(filters?: NotificationFilters, page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const response = await apiService.get('/notifications', {
        params: { ...filters, page, limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      throw error
    }
  },

  // Buscar notificação por ID
  async getNotificationById(id: number): Promise<Notification> {
    try {
      const response = await apiService.get(`/notifications/${id}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar notificação:', error)
      throw error
    }
  },

  // Criar nova notificação
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await apiService.post('/notifications', notificationData)
      return response
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  },

  // Atualizar notificação
  async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await apiService.put(`/notifications/${id}`, notificationData)
      return response
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error)
      throw error
    }
  },

  // Deletar notificação
  async deleteNotification(id: number): Promise<void> {
    try {
      await apiService.delete(`/notifications/${id}`)
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      throw error
    }
  },

  // Marcar notificação como lida
  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await apiService.put(`/notifications/${id}/read`)
      return response
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      throw error
    }
  },

  // Marcar todas como lidas
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await apiService.put('/notifications/mark-all-read', { userId })
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      throw error
    }
  },

  // Buscar estatísticas de notificações
  async getNotificationStats(filters?: NotificationFilters): Promise<NotificationStats> {
    try {
      const response = await apiService.get('/notifications/stats', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notificações:', error)
      throw error
    }
  },

  // Buscar notificações não lidas
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications/unread', {
        params: { userId }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error)
      throw error
    }
  },

  // Buscar notificações urgentes
  async getUrgentNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications/urgent', {
        params: { userId }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar notificações urgentes:', error)
      throw error
    }
  },

  // Buscar notificações por tipo
  async getNotificationsByType(type: string, filters?: NotificationFilters): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications', {
        params: { ...filters, type }
      })
      return response.notifications
    } catch (error) {
      console.error('Erro ao buscar notificações por tipo:', error)
      throw error
    }
  },

  // Buscar notificações por prioridade
  async getNotificationsByPriority(priority: string, filters?: NotificationFilters): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications', {
        params: { ...filters, priority }
      })
      return response.notifications
    } catch (error) {
      console.error('Erro ao buscar notificações por prioridade:', error)
      throw error
    }
  },

  // Buscar notificações recentes
  async getRecentNotifications(userId: number, limit: number = 10): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications/recent', {
        params: { userId, limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar notificações recentes:', error)
      throw error
    }
  },

  // Buscar notificações por processo
  async getNotificationsByProcess(processId: number): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications', {
        params: { processId }
      })
      return response.notifications
    } catch (error) {
      console.error('Erro ao buscar notificações por processo:', error)
      throw error
    }
  },

  // Buscar notificações por tarefa
  async getNotificationsByTask(taskId: number): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notifications', {
        params: { taskId }
      })
      return response.notifications
    } catch (error) {
      console.error('Erro ao buscar notificações por tarefa:', error)
      throw error
    }
  },

  // Enviar notificação em lote
  async sendBulkNotification(notificationData: {
    title: string
    message: string
    type: string
    priority: string
    userIds: number[]
    processId?: number
    taskId?: number
  }): Promise<Notification[]> {
    try {
      const response = await apiService.post('/notifications/bulk', notificationData)
      return response
    } catch (error) {
      console.error('Erro ao enviar notificação em lote:', error)
      throw error
    }
  },

  // Exportar notificações
  async exportNotifications(format: 'csv' | 'pdf', filters?: NotificationFilters): Promise<Blob> {
    try {
      const response = await apiService.get('/notifications/export', {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar notificações:', error)
      throw error
    }
  }
}