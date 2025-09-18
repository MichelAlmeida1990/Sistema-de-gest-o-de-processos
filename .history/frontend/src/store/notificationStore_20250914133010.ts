import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  showNotificationCenter: boolean
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  toggleNotificationCenter: () => void
  getUnreadCount: () => number
}

type NotificationStore = NotificationState & NotificationActions

const initialState: NotificationState = {
  notifications: [
    {
      id: '1',
      title: 'Nova Tarefa Atribuída',
      message: 'Você recebeu uma nova tarefa de cálculo de rescisão',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/tasks',
      actionText: 'Ver Tarefa',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Prazo Vencendo',
      message: 'O processo 1001234-56.2024.8.26.0001 vence em 2 dias',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: '/processes',
      actionText: 'Ver Processo',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Pagamento Processado',
      message: 'Seu pagamento de R$ 2.500,00 foi processado com sucesso',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      actionUrl: '/financial',
      actionText: 'Ver Detalhes',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Sistema Atualizado',
      message: 'Nova versão do sistema disponível com melhorias',
      type: 'info',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      priority: 'low'
    }
  ],
  unreadCount: 2,
  showNotificationCenter: false
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      })),
      unreadCount: 0
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id)
      const wasUnread = notification && !notification.read
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      }
    })
  },

  clearAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0
    })
  },

  toggleNotificationCenter: () => {
    set((state) => ({
      showNotificationCenter: !state.showNotificationCenter
    }))
  },

  getUnreadCount: () => {
    return get().unreadCount
  }
}))
