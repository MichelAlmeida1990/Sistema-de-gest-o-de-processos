import React from 'react'
import { Button, Dropdown, message } from 'antd'
import { PlusOutlined, BellOutlined } from '@ant-design/icons'
import { useNotificationStore, createTaskNotification, createProcessNotification, createPaymentNotification } from '../store/notificationStore'

export const NotificationTestButton: React.FC = () => {
  const { addNotification } = useNotificationStore()

  const testNotifications = [
    {
      key: 'task_assigned',
      label: 'Nova Tarefa Atribuída',
      onClick: () => {
        createTaskNotification(
          'assigned',
          'Revisar Cálculos Previdenciários',
          '5001234-56.2024.8.26.0005'
        )
        message.success('Notificação de tarefa criada!')
      }
    },
    {
      key: 'deadline_warning',
      label: 'Aviso de Prazo',
      onClick: () => {
        createTaskNotification(
          'deadline_warning',
          'Protocolo de Recurso',
          '2001234-56.2024.8.26.0002'
        )
        message.success('Aviso de prazo criado!')
      }
    },
    {
      key: 'process_updated',
      label: 'Processo Atualizado',
      onClick: () => {
        createProcessNotification(
          'status_changed',
          '3001234-56.2024.8.26.0003',
          { oldStatus: 'Em Andamento', newStatus: 'Concluído' }
        )
        message.success('Notificação de processo criada!')
      }
    },
    {
      key: 'payment_due',
      label: 'Pagamento Vencendo',
      onClick: () => {
        createPaymentNotification(
          'due',
          'Ana Calculista',
          2500.00,
          { dueDate: '2024-01-30' }
        )
        message.success('Notificação de pagamento criada!')
      }
    },
    {
      key: 'custom_success',
      label: 'Sucesso Personalizado',
      onClick: () => {
        addNotification({
          type: 'success',
          title: 'Backup Realizado',
          message: 'Backup automático do sistema foi realizado com sucesso. Todos os dados estão seguros.',
          priority: 'low',
          category: 'system',
          actionUrl: '/admin'
        })
        message.success('Notificação personalizada criada!')
      }
    },
    {
      key: 'custom_urgent',
      label: 'Urgente Personalizado',
      onClick: () => {
        addNotification({
          type: 'error',
          title: 'Ação Urgente Necessária',
          message: 'Prazo para contestação vence hoje às 18:00h. Processo: Ação Civil - Danos Morais.',
          priority: 'high',
          category: 'deadline',
          actionUrl: '/processes'
        })
        message.success('Notificação urgente criada!')
      }
    }
  ]

  return (
    <Dropdown
      menu={{
        items: testNotifications
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        size="small"
        style={{
          borderColor: '#191970',
          color: '#191970',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(25, 25, 112, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          fontSize: '12px',
          height: '32px',
          padding: '4px 12px',
          whiteSpace: 'nowrap'
        }}
      >
        Testar
      </Button>
    </Dropdown>
  )
}
