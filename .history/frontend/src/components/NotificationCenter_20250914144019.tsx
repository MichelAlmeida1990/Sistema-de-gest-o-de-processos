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
import { useNotificationStore, Notification } from '../store/notificationStore'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography
const { TabPane } = Tabs

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
    <List.Item
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: notification.read ? 'transparent' : '#f6ffed',
        borderLeft: notification.read ? 'none' : '3px solid #52c41a',
        borderRadius: '8px',
        marginBottom: '8px',
        transition: 'all 0.2s'
      }}
      onClick={() => handleNotificationClick(notification)}
      actions={[
        <Tooltip title="Marcar como lida">
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              markAsRead(notification.id)
            }}
            disabled={notification.read}
          />
        </Tooltip>,
        <Tooltip title="Remover">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              removeNotification(notification.id)
            }}
          />
        </Tooltip>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={40}
            style={{
              backgroundColor: notification.read ? '#f5f5f5' : '#e6f7ff',
              color: notification.read ? '#999' : '#1890ff'
            }}
            icon={getNotificationIcon(notification.type, notification.category)}
          />
        }
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text strong style={{ fontSize: '14px', color: notification.read ? '#999' : '#000' }}>
              {notification.title}
            </Text>
            <Tag color={getPriorityColor(notification.priority)} size="small">
              {notification.priority === 'high' ? 'Alta' : notification.priority === 'medium' ? 'Média' : 'Baixa'}
            </Tag>
            <Tag color="blue" size="small">
              {getCategoryText(notification.category)}
            </Tag>
          </div>
        }
        description={
          <div>
            <Text style={{ fontSize: '13px', color: notification.read ? '#999' : '#666' }}>
              {notification.message}
            </Text>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
              <Text style={{ fontSize: '11px', color: '#999' }}>
                {dayjs(notification.timestamp).fromNow()}
              </Text>
              {!notification.read && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    marginLeft: '8px'
                  }}
                />
              )}
            </div>
          </div>
        }
      />
    </List.Item>
  )

  const filteredNotifications = getFilteredNotifications()

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellOutlined />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </div>
          <Space>
            <Button
              type="text"
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como lidas
            </Button>
            <Button
              type="text"
              size="small"
              danger
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Limpar todas
            </Button>
          </Space>
        </div>
      }
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      styles={{ body: { padding: '0' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        style={{ margin: '0 16px' }}
      >
        <TabPane
          tab={
            <span>
              Todas
              {notifications.length > 0 && (
                <Badge count={notifications.length} size="small" style={{ marginLeft: '4px' }} />
              )}
            </span>
          }
          key="all"
        />
        <TabPane
          tab={
            <span>
              Não lidas
              {unreadCount > 0 && (
                <Badge count={unreadCount} size="small" style={{ marginLeft: '4px' }} />
              )}
            </span>
          }
          key="unread"
        />
        <TabPane tab="Tarefas" key="tasks" />
        <TabPane tab="Processos" key="processes" />
        <TabPane tab="Prazos" key="deadlines" />
        <TabPane tab="Pagamentos" key="payments" />
      </Tabs>

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
}
