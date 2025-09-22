import apiService from './api'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'task' | 'process' | 'system' | 'payment'
  read: boolean
  created_date: string
  metadata?: Record<string, any>
  user_id: number
  process_id?: number
  task_id?: number
}

export interface NotificationCreate {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'task' | 'process' | 'system' | 'payment'
  user_id: number
  process_id?: number
  task_id?: number
  metadata?: Record<string, any>
}

export interface NotificationListResponse {
  notifications: Notification[]
  total: number
  page: number
  per_page: number
  unread_count: number
}

class NotificationService {
  private baseUrl = '/notifications'

  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unread_only: boolean = false,
    category?: string
  ): Promise<NotificationListResponse> {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
      unread_only: unread_only.toString(),
      ...(category && { category })
    })

    const response = await apiService.get<NotificationListResponse>(
      `${this.baseUrl}?${params}`
    )
    return response
  }

  async getNotification(id: number): Promise<Notification> {
    const response = await apiService.get<Notification>(`${this.baseUrl}/${id}`)
    return response
  }

  async createNotification(notificationData: NotificationCreate): Promise<Notification> {
    const response = await apiService.post<Notification>(this.baseUrl, notificationData)
    return response
  }

  async markAsRead(id: number): Promise<Notification> {
    const response = await apiService.patch<Notification>(`${this.baseUrl}/${id}/read`)
    return response
  }

  async markAllAsRead(): Promise<void> {
    await apiService.patch(`${this.baseUrl}/read-all`)
  }

  async deleteNotification(id: number): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`)
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>(`${this.baseUrl}/unread-count`)
    return response.count
  }

  async getNotificationsByCategory(category: string): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`${this.baseUrl}/category/${category}`)
    return response
  }
}

export const notificationService = new NotificationService()



