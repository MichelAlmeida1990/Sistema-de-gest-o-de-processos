import React, { useEffect } from 'react'
import { notification } from 'antd'
import { useNotificationStore } from '../store/notificationStore'

export const NotificationToast: React.FC = () => {
  const { notifications, markAsRead } = useNotificationStore()

  useEffect(() => {
    // Verificar se há notificações não lidas para mostrar toast
    const unreadNotifications = notifications.filter(n => !n.read)
    
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0] // A mais recente
      
      // Mostrar toast apenas para notificações de alta prioridade
      if (latestNotification.priority === 'high') {
        notification[latestNotification.type]({
          message: latestNotification.title,
          description: latestNotification.message,
          duration: 6,
          placement: 'topRight',
          onClick: () => {
            markAsRead(latestNotification.id)
            if (latestNotification.actionUrl) {
              window.location.href = latestNotification.actionUrl
            }
          }
        })
      }
    }
  }, [notifications, markAsRead])

  return null // Este componente não renderiza nada visual
}

// Hook para solicitar permissão de notificações do navegador
export const useNotificationPermission = () => {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
}












