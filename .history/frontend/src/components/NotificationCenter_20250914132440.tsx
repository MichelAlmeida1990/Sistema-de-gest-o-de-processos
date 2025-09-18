import React from 'react'
import { 
  Drawer, List, Badge, Button, Typography, Tag, Space, 
  Empty, Avatar, Tooltip, Divider, notification
} from 'antd'
import {
  BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { useNotificationStore, Notification } from '../store/notificationStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    showNotificationCenter,
    toggleNotificationCenter,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotificationStore()

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      case 'error': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'info': return <InfoCircleOutlined style={{ color: '#1890ff' }} />
      default: return <InfoCircleOutlined style={{ color: '#666' }} />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      // Aqui você pode implementar navegação
      notification.success({
        message: 'Navegando...',
        description: `Redirecionando para ${notification.actionUrl}`,
        duration: 2
      })
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    notification.success({
      message: 'Todas as notificações marcadas como lidas',
      duration: 2
    })
  }

  const handleClearAll = () => {
    clearAllNotifications()
    notification.success({
      message: 'Todas as notificações removidas',
      duration: 2
    })
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <>
      {/* Botão de Notificações no Header */}
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={toggleNotificationCenter}
          style={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            border: '1px solid #e8e8e8',
            background: '#fafafa',
            position: 'relative'
          }}
        />
      </Badge>

      {/* Drawer do Centro de Notificações */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BellOutlined style={{ color: '#031f5f' }} />
              <Title level={4} style={{ margin: 0, color: '#031f5f' }}>
                Notificações
              </Title>
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
              )}
            </div>
            <Space>
              {unreadCount > 0 && (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckOutlined />}
                  onClick={handleMarkAllAsRead}
                  style={{ color: '#52c41a' }}
                >
                  Marcar todas como lidas
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />}
                  onClick={handleClearAll}
                  style={{ color: '#ff4d4f' }}
                >
                  Limpar todas
                </Button>
              )}
            </Space>
          </div>
        }
        placement="right"
        onClose={toggleNotificationCenter}
        open={showNotificationCenter}
        width={400}
        style={{ zIndex: 1001 }}
        bodyStyle={{ padding: '0' }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Notificações Não Lidas */}
          {unreadNotifications.length > 0 && (
            <div style={{ padding: '16px 16px 0' }}>
              <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                Não Lidas ({unreadNotifications.length})
              </Text>
              <List
                dataSource={unreadNotifications}
                renderItem={(notification) => (
                  <List.Item
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                      background: '#fff2f0',
                      margin: '8px 0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffe7e6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff2f0'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={40} 
                          icon={getNotificationIcon(notification.type)}
                          style={{ 
                            background: notification.type === 'error' ? '#ff4d4f' : 
                                      notification.type === 'warning' ? '#faad14' :
                                      notification.type === 'success' ? '#52c41a' : '#1890ff'
                          }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text strong style={{ fontSize: '14px' }}>
                            {notification.title}
                          </Text>
                          <Tag color={getPriorityColor(notification.priority)} size="small">
                            {notification.priority === 'high' ? 'Alta' : 
                             notification.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                            {notification.message}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: '11px', color: '#999' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              {dayjs(notification.createdAt).fromNow()}
                            </Text>
                            {notification.actionText && (
                              <Button 
                                type="link" 
                                size="small" 
                                icon={<EyeOutlined />}
                                style={{ padding: 0, height: 'auto', fontSize: '11px' }}
                              >
                                {notification.actionText}
                              </Button>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Divisor */}
          {unreadNotifications.length > 0 && readNotifications.length > 0 && (
            <Divider style={{ margin: '16px 0' }} />
          )}

          {/* Notificações Lidas */}
          {readNotifications.length > 0 && (
            <div style={{ padding: unreadNotifications.length > 0 ? '0 16px' : '16px' }}>
              <Text strong style={{ color: '#666', fontSize: '14px' }}>
                Lidas ({readNotifications.length})
              </Text>
              <List
                dataSource={readNotifications}
                renderItem={(notification) => (
                  <List.Item
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={32} 
                          icon={getNotificationIcon(notification.type)}
                          style={{ 
                            background: '#e8e8e8',
                            color: '#666'
                          }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text style={{ fontSize: '13px' }}>
                            {notification.title}
                          </Text>
                          <Tag color="default" size="small">
                            {notification.priority === 'high' ? 'Alta' : 
                             notification.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '4px' }}>
                            {notification.message}
                          </Text>
                          <Text style={{ fontSize: '10px', color: '#ccc' }}>
                            {dayjs(notification.createdAt).fromNow()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Estado Vazio */}
          {notifications.length === 0 && (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px 16px'
            }}>
              <Empty
                image={<BellOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                description={
                  <div>
                    <Text style={{ color: '#666', fontSize: '16px' }}>
                      Nenhuma notificação
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ color: '#999', fontSize: '14px' }}>
                        Você está em dia! Novas notificações aparecerão aqui.
                      </Text>
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}
