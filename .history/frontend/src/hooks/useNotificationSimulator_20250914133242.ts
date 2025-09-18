import { useEffect } from 'react'
import { useNotificationStore } from '../store/notificationStore'

export const useNotificationSimulator = () => {
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    // Simular notificações em tempo real
    const notificationTemplates = [
      {
        title: 'Nova Tarefa Atribuída',
        message: 'Você recebeu uma nova tarefa de cálculo trabalhista',
        type: 'info' as const,
        priority: 'high' as const,
        actionUrl: '/tasks',
        actionText: 'Ver Tarefa'
      },
      {
        title: 'Prazo Vencendo',
        message: 'O processo 2001234-56.2024.8.26.0002 vence em 1 dia',
        type: 'warning' as const,
        priority: 'high' as const,
        actionUrl: '/processes',
        actionText: 'Ver Processo'
      },
      {
        title: 'Entrega Concluída',
        message: 'Carlos Lima concluiu a entrega do cálculo de rescisão',
        type: 'success' as const,
        priority: 'medium' as const,
        actionUrl: '/deliveries',
        actionText: 'Ver Entrega'
      },
      {
        title: 'Pagamento Processado',
        message: 'Pagamento de R$ 1.500,00 foi processado com sucesso',
        type: 'success' as const,
        priority: 'medium' as const,
        actionUrl: '/financial',
        actionText: 'Ver Detalhes'
      },
      {
        title: 'Sistema de Backup',
        message: 'Backup automático realizado com sucesso',
        type: 'info' as const,
        priority: 'low' as const
      }
    ]

    // Gerar notificação aleatória a cada 30-60 segundos
    const interval = setInterval(() => {
      const randomTemplate = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
      addNotification(randomTemplate)
    }, Math.random() * 30000 + 30000) // 30-60 segundos

    // Limpar intervalo quando componente for desmontado
    return () => clearInterval(interval)
  }, [addNotification])
}
