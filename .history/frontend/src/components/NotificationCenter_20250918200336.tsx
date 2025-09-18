import React, { useState } from 'react'
import { 
  Drawer, List, Avatar, Badge, Button, Typography, Space, Tag, 
  Tooltip, Empty, Divider, Tabs, message
} from 'antd'
import {
  BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined,
  UserOutlined, FileTextOutlined, DollarOutlined, AlertOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')
import { useNotificationStore, Notification } from '../store/notificationStore'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography

interface NotificationCenterProps {
  visible: boolean
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  
  try {
    const {
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      getNotificationsByCategory,
      getUnreadNotifications
    } = useNotificationStore()

    if (!notifications || !Array.isArray(notifications)) {
      console.error('Notifications store is not properly initialized')
      return (
        <Drawer
          title="Erro"
          placement="right"
          width={400}
          open={visible}
          onClose={onClose}
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Erro ao carregar notificações. Tente novamente.</p>
          </div>
        </Drawer>
      )
    }

  const getNotificationIcon = (type: string, category: string) => {
    const iconProps = { style: { fontSize: '16px' } }
    
    if (category === 'deadline') return <CalendarOutlined {...iconProps} style={{ color: '#faad14' }} />
    if (category === 'task') return <CheckCircleOutlined {...iconProps} style={{ color: '#1890ff' }} />
    if (category === 'process') return <FileTextOutlined {...iconProps} style={{ color: '#52c41a' }} />
    if (category === 'payment') return <DollarOutlined {...iconProps} style={{ color: '#722ed1' }} />
    
    switch (type) {
      case 'success': return <CheckCircleOutlined {...iconProps} style={{ color: '#52c41a' }} />
      case 'warning': return <ExclamationCircleOutlined {...iconProps} style={{ color: '#faad14' }} />
      case 'error': return <CloseCircleOutlined {...iconProps} style={{ color: '#ff4d4f' }} />
      case 'info': return <InfoCircleOutlined {...iconProps} style={{ color: '#1890ff' }} />
      default: return <BellOutlined {...iconProps} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success': return '#52c41a'
      case 'warning': return '#faad14'
      case 'error': return '#ff4d4f'
      case 'info': return '#1890ff'
      default: return '#1890ff'
    }
  }

  const getNotificationAvatarColor = (type: string) => {
    switch (type) {
      case 'success': return '#52c41a'
      case 'warning': return '#faad14'
      case 'error': return '#ff4d4f'
      case 'info': return '#1890ff'
      default: return '#1890ff'
    }
  }

  const getPriorityTagColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return priority
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'task': return 'Tarefa'
      case 'process': return 'Processo'
      case 'system': return 'Sistema'
      case 'deadline': return 'Prazo'
      case 'payment': return 'Pagamento'
      default: return category
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose()
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    message.success('Todas as notificações foram marcadas como lidas')
  }

  const handleClearAll = () => {
    clearAllNotifications()
    message.success('Todas as notificações foram removidas')
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return getUnreadNotifications()
      case 'tasks':
        return getNotificationsByCategory('task')
      case 'processes':
        return getNotificationsByCategory('process')
      case 'deadlines':
        return getNotificationsByCategory('deadline')
      case 'payments':
        return getNotificationsByCategory('payment')
      default:
        return notifications
    }
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      style={{
        padding: '16px',
        cursor: 'pointer',
        backgroundColor: notification.read ? '#fafafa' : '#fff',
        border: `1px solid ${notification.read ? '#f0f0f0' : '#e6f7ff'}`,
        borderLeft: `4px solid ${notification.read ? '#d9d9d9' : getNotificationBorderColor(notification.type)}`,
        borderRadius: '12px',
        marginBottom: '12px',
        transition: 'all 0.3s ease',
        boxShadow: notification.read ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
      onClick={() => handleNotificationClick(notification)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = notification.read ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Avatar */}
        <Avatar
          size={44}
          style={{
            backgroundColor: getNotificationAvatarColor(notification.type),
            color: '#fff',
            flexShrink: 0
          }}
          icon={getNotificationIcon(notification.type, notification.category)}
        />
        
        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ 
                fontSize: '14px', 
                color: notification.read ? '#999' : '#262626',
                lineHeight: 1.4
              }}>
                {notification.title}
              </Text>
              {!notification.read && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    flexShrink: 0
                  }}
                />
              )}
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {!notification.read && (
                <Tooltip title="Marcar como lida">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                      message.success('Notificação marcada como lida')
                    }}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              )}
              <Tooltip title="Remover">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(notification.id)
                    message.success('Notificação removida')
                  }}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
            </div>
          </div>
          
          {/* Tags */}
          <div style={{ marginBottom: '8px' }}>
            <Space size={4}>
              <Tag 
                color={getPriorityTagColor(notification.priority)} 
                style={{ fontSize: '11px', margin: 0 }}
              >
                {getPriorityText(notification.priority)}
              </Tag>
              <Tag 
                color="blue" 
                style={{ fontSize: '11px', margin: 0 }}
              >
                {getCategoryText(notification.category)}
              </Tag>
            </Space>
          </div>
          
          {/* Message */}
          <Text style={{ 
            fontSize: '13px', 
            color: notification.read ? '#999' : '#595959',
            lineHeight: 1.5,
            display: 'block',
            marginBottom: '8px'
          }}>
            {notification.message}
          </Text>
          
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClockCircleOutlined style={{ fontSize: '12px', color: '#bfbfbf' }} />
              <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
                {dayjs(notification.timestamp).fromNow()}
              </Text>
            </div>
            
            {notification.actionUrl && (
              <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                Clique para ver →
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const filteredNotifications = getFilteredNotifications()

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BellOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Notificações
            </Title>
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                style={{ 
                  backgroundColor: '#ff4d4f',
                  fontSize: '12px',
                  minWidth: '20px',
                  height: '20px',
                  lineHeight: '20px'
                }} 
              />
            )}
          </div>
        </div>
      }
      placement="right"
      width={450}
      open={visible}
      onClose={onClose}
      styles={{ 
        body: { 
          padding: '0',
          background: '#f8f9fa'
        },
        header: {
          borderBottom: '1px solid #f0f0f0',
          background: '#fff'
        }
      }}
      extra={
        <Space>
          <Tooltip title="Marcar todas como lidas">
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Limpar todas">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        style={{ margin: '0 16px' }}
        items={[
          {
            key: 'all',
            label: (
              <span>
                Todas
                {notifications.length > 0 && (
                  <Badge count={notifications.length} size="small" style={{ marginLeft: '4px' }} />
                )}
              </span>
            ),
          },
          {
            key: 'unread',
            label: (
              <span>
                Não lidas
                {unreadCount > 0 && (
                  <Badge count={unreadCount} size="small" style={{ marginLeft: '4px' }} />
                )}
              </span>
            ),
          },
          {
            key: 'tasks',
            label: 'Tarefas',
          },
          {
            key: 'processes',
            label: 'Processos',
          },
          {
            key: 'deadlines',
            label: 'Prazos',
          },
          {
            key: 'payments',
            label: 'Pagamentos',
          },
        ]}
      />

      <Divider style={{ margin: '8px 0' }} />

      <div style={{ padding: '0 16px', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === 'unread' 
                ? 'Nenhuma notificação não lida'
                : activeTab === 'all'
                ? 'Nenhuma notificação'
                : `Nenhuma notificação de ${getCategoryText(activeTab).toLowerCase()}`
            }
            style={{ marginTop: '40px' }}
          />
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={(notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            )}
            split={false}
          />
        )}
      </div>
    </Drawer>
  )

  } catch (error) {
    console.error('Error in NotificationCenter:', error)
    return (
      <Drawer
        title="Erro"
        placement="right"
        width={400}
        open={visible}
        onClose={onClose}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Erro inesperado ao carregar notificações.</p>
          <p>Tente recarregar a página.</p>
        </div>
      </Drawer>
    )
  }
}
