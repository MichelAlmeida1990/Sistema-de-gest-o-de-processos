import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'task' | 'process' | 'system' | 'deadline' | 'payment'
  actionUrl?: string
  metadata?: Record<string, any>
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  getNotificationsByCategory: (category: string) => Notification[]
  getUnreadNotifications: () => Notification[]
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    // Notificações iniciais mockadas
    {
      id: '1',
      type: 'warning',
      title: 'Prazo Próximo',
      message: 'A tarefa "Cálculo de Rescisão" vence em 2 dias',
      timestamp: '2024-01-20T10:30:00',
      read: false,
      priority: 'high',
      category: 'deadline',
      actionUrl: '/tasks',
      metadata: {
        taskId: '1',
        dueDate: '2024-01-22',
        processNumber: '1001234-56.2024.8.26.0001'
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'Nova Tarefa',
      message: 'Você foi atribuído à tarefa "Análise de Documentos"',
      timestamp: '2024-01-19T14:20:00',
      read: false,
      priority: 'medium',
      category: 'task',
      actionUrl: '/tasks',
      metadata: {
        taskId: '2',
        assignee: 'Ana Santos',
        processNumber: '2001234-56.2024.8.26.0002'
      }
    },
    {
      id: '3',
      type: 'success',
      title: 'Processo Atualizado',
      message: 'O status do processo 1001234-56.2024.8.26.0001 foi alterado para "Em Andamento"',
      timestamp: '2024-01-18T16:45:00',
      read: true,
      priority: 'medium',
      category: 'process',
      actionUrl: '/processes',
      metadata: {
        processId: '1',
        oldStatus: 'Pendente',
        newStatus: 'Em Andamento'
      }
    },
    {
      id: '4',
      type: 'error',
      title: 'Pagamento Atrasado',
      message: 'O pagamento para Carlos Lima está atrasado há 5 dias',
      timestamp: '2024-01-17T09:15:00',
      read: false,
      priority: 'high',
      category: 'payment',
      actionUrl: '/financial',
      metadata: {
        partnerId: '1',
        partnerName: 'Carlos Lima',
        dueDate: '2024-01-12',
        amount: 1500.00
      }
    }
  ],

  unreadCount: 3, // Calculado dinamicamente

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    
    set((state) => {
      const newNotifications = [newNotification, ...state.notifications]
      const unreadCount = newNotifications.filter(n => !n.read).length
      
      return {
        notifications: newNotifications,
        unreadCount
      }
    })

    // Simular notificação push no navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.message,
        icon: '/vite.svg',
        tag: newNotification.id
      })
    }
  },

  markAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
      const unreadCount = updatedNotifications.filter(n => !n.read).length
      
      return {
        notifications: updatedNotifications,
        unreadCount
      }
    })
  },

  markAllAsRead: () => {
    set((state) => {
      const updatedNotifications = state.notifications.map(notification =>
        ({ ...notification, read: true })
      )
      
      return {
        notifications: updatedNotifications,
        unreadCount: 0
      }
    })
  },

  removeNotification: (id) => {
    set((state) => {
      const filteredNotifications = state.notifications.filter(n => n.id !== id)
      const unreadCount = filteredNotifications.filter(n => !n.read).length
      
      return {
        notifications: filteredNotifications,
        unreadCount
      }
    })
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  getNotificationsByCategory: (category) => {
    return get().notifications.filter(n => n.category === category)
  },

  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read)
  }
}))

// Funções utilitárias para criar notificações específicas
export const createTaskNotification = (
  type: 'assigned' | 'completed' | 'deadline_warning' | 'deadline_overdue',
  taskTitle: string,
  processNumber: string,
  metadata?: Record<string, any>
) => {
  const notificationMap = {
    assigned: {
      type: 'info' as const,
      title: 'Nova Tarefa',
      message: `Você foi atribuído à tarefa "${taskTitle}"`,
      priority: 'medium' as const,
      category: 'task' as const,
      actionUrl: '/tasks'
    },
    completed: {
      type: 'success' as const,
      title: 'Tarefa Concluída',
      message: `A tarefa "${taskTitle}" foi concluída`,
      priority: 'low' as const,
      category: 'task' as const,
      actionUrl: '/tasks'
    },
    deadline_warning: {
      type: 'warning' as const,
      title: 'Prazo Próximo',
      message: `A tarefa "${taskTitle}" vence em breve`,
      priority: 'high' as const,
      category: 'deadline' as const,
      actionUrl: '/tasks'
    },
    deadline_overdue: {
      type: 'error' as const,
      title: 'Prazo Vencido',
      message: `A tarefa "${taskTitle}" está atrasada`,
      priority: 'high' as const,
      category: 'deadline' as const,
      actionUrl: '/tasks'
    }
  }

  const notificationData = notificationMap[type]
  
  useNotificationStore.getState().addNotification({
    ...notificationData,
    metadata: {
      ...metadata,
      taskTitle,
      processNumber
    }
  })
}

export const createProcessNotification = (
  type: 'created' | 'updated' | 'status_changed',
  processNumber: string,
  metadata?: Record<string, any>
) => {
  const notificationMap = {
    created: {
      type: 'info' as const,
      title: 'Novo Processo',
      message: `Novo processo ${processNumber} foi criado`,
      priority: 'medium' as const,
      category: 'process' as const,
      actionUrl: '/processes'
    },
    updated: {
      type: 'info' as const,
      title: 'Processo Atualizado',
      message: `O processo ${processNumber} foi atualizado`,
      priority: 'low' as const,
      category: 'process' as const,
      actionUrl: '/processes'
    },
    status_changed: {
      type: 'success' as const,
      title: 'Status Alterado',
      message: `O status do processo ${processNumber} foi alterado`,
      priority: 'medium' as const,
      category: 'process' as const,
      actionUrl: '/processes'
    }
  }

  const notificationData = notificationMap[type]
  
  useNotificationStore.getState().addNotification({
    ...notificationData,
    metadata: {
      ...metadata,
      processNumber
    }
  })
}

export const createPaymentNotification = (
  type: 'due' | 'overdue' | 'paid',
  partnerName: string,
  amount: number,
  metadata?: Record<string, any>
) => {
  const notificationMap = {
    due: {
      type: 'warning' as const,
      title: 'Pagamento Vencendo',
      message: `Pagamento para ${partnerName} vence em breve`,
      priority: 'medium' as const,
      category: 'payment' as const,
      actionUrl: '/financial'
    },
    overdue: {
      type: 'error' as const,
      title: 'Pagamento Atrasado',
      message: `Pagamento para ${partnerName} está atrasado`,
      priority: 'high' as const,
      category: 'payment' as const,
      actionUrl: '/financial'
    },
    paid: {
      type: 'success' as const,
      title: 'Pagamento Realizado',
      message: `Pagamento para ${partnerName} foi realizado`,
      priority: 'low' as const,
      category: 'payment' as const,
      actionUrl: '/financial'
    }
  }

  const notificationData = notificationMap[type]
  
  useNotificationStore.getState().addNotification({
    ...notificationData,
    metadata: {
      ...metadata,
      partnerName,
      amount
    }
  })
}

