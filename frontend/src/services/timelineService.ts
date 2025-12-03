// ===========================================
// SERVIÇO TIMELINE - DADOS REAIS
// ===========================================

import { apiService } from './api'

export interface TimelineEvent {
  id: number
  title: string
  description: string
  eventType: string
  status: string
  createdAt: string
  user: string
  processId?: number
  taskId?: number
  metadata?: any
}

export interface TimelineFilters {
  eventType?: string
  status?: string
  userId?: number
  processId?: number
  taskId?: number
  startDate?: string
  endDate?: string
  search?: string
}

export interface TimelineStats {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByStatus: Record<string, number>
  recentActivity: number
  userActivity: Record<string, number>
}

export const timelineService = {
  // Buscar eventos da timeline
  async getTimelineEvents(filters?: TimelineFilters, page: number = 1, limit: number = 50): Promise<{
    events: TimelineEvent[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const response = await apiService.get('/timeline/events', {
        params: { ...filters, page, limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar eventos da timeline:', error)
      throw error
    }
  },

  // Buscar evento por ID
  async getEventById(id: number): Promise<TimelineEvent> {
    try {
      const response = await apiService.get(`/timeline/events/${id}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar evento:', error)
      throw error
    }
  },

  // Criar novo evento
  async createEvent(eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    try {
      const response = await apiService.post('/timeline/events', eventData)
      return response
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }
  },

  // Atualizar evento
  async updateEvent(id: number, eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    try {
      const response = await apiService.put(`/timeline/events/${id}`, eventData)
      return response
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw error
    }
  },

  // Deletar evento
  async deleteEvent(id: number): Promise<void> {
    try {
      await apiService.delete(`/timeline/events/${id}`)
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
      throw error
    }
  },

  // Buscar estatísticas da timeline
  async getTimelineStats(filters?: TimelineFilters): Promise<TimelineStats> {
    try {
      const response = await apiService.get('/timeline/stats', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar estatísticas da timeline:', error)
      throw error
    }
  },

  // Buscar eventos por tipo
  async getEventsByType(eventType: string, filters?: TimelineFilters): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get('/timeline/events', {
        params: { ...filters, eventType }
      })
      return response.events
    } catch (error) {
      console.error('Erro ao buscar eventos por tipo:', error)
      throw error
    }
  },

  // Buscar eventos por usuário
  async getEventsByUser(userId: number, filters?: TimelineFilters): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get('/timeline/events', {
        params: { ...filters, userId }
      })
      return response.events
    } catch (error) {
      console.error('Erro ao buscar eventos por usuário:', error)
      throw error
    }
  },

  // Buscar eventos por processo
  async getEventsByProcess(processId: number, filters?: TimelineFilters): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get('/timeline/events', {
        params: { ...filters, processId }
      })
      return response.events
    } catch (error) {
      console.error('Erro ao buscar eventos por processo:', error)
      throw error
    }
  },

  // Buscar eventos recentes
  async getRecentEvents(limit: number = 10): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get('/timeline/recent', {
        params: { limit }
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar eventos recentes:', error)
      throw error
    }
  },

  // Buscar eventos por período
  async getEventsByPeriod(startDate: string, endDate: string, filters?: TimelineFilters): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get('/timeline/events', {
        params: { ...filters, startDate, endDate }
      })
      return response.events
    } catch (error) {
      console.error('Erro ao buscar eventos por período:', error)
      throw error
    }
  },

  // Buscar atividades do usuário
  async getUserActivity(userId: number, filters?: TimelineFilters): Promise<{
    events: TimelineEvent[]
    stats: {
      totalEvents: number
      eventsByType: Record<string, number>
      mostActiveDay: string
      averageEventsPerDay: number
    }
  }> {
    try {
      const response = await apiService.get(`/timeline/user/${userId}/activity`, {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error)
      throw error
    }
  },

  // Buscar timeline de processo
  async getProcessTimeline(processId: number): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get(`/timeline/process/${processId}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar timeline do processo:', error)
      throw error
    }
  },

  // Buscar timeline de tarefa
  async getTaskTimeline(taskId: number): Promise<TimelineEvent[]> {
    try {
      const response = await apiService.get(`/timeline/task/${taskId}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar timeline da tarefa:', error)
      throw error
    }
  },

  // Exportar timeline
  async exportTimeline(format: 'csv' | 'pdf', filters?: TimelineFilters): Promise<Blob> {
    try {
      const response = await apiService.get('/timeline/export', {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar timeline:', error)
      throw error
    }
  }
}















