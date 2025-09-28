import React from 'react'
import { Card, Typography, List, Avatar, Badge, Button, Space, Empty } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export const NotificationsPage: React.FC = () => {
  // Dados mock para demonstração
  const notifications = [
    {
      id: 1,
      title: 'Nova tarefa atribuída',
      message: 'Você foi atribuído à tarefa "Revisar contrato"',
      time: '2 minutos atrás',
      read: false,
      type: 'task'
    },
    {
      id: 2,
      title: 'Processo atualizado',
      message: 'O processo #12345 foi atualizado com novas informações',
      time: '1 hora atrás',
      read: true,
      type: 'process'
    },
    {
      id: 3,
      title: 'Prazo próximo',
      message: 'A entrega do projeto "Sistema Legal" vence em 2 dias',
      time: '3 horas atrás',
      read: false,
      type: 'deadline'
    },
    {
      id: 4,
      title: 'Relatório gerado',
      message: 'O relatório mensal foi gerado com sucesso',
      time: '1 dia atrás',
      read: true,
      type: 'report'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <BellOutlined style={{ color: '#1890ff' }} />
      case 'process':
        return <BellOutlined style={{ color: '#52c41a' }} />
      case 'deadline':
        return <BellOutlined style={{ color: '#faad14' }} />
      case 'report':
        return <BellOutlined style={{ color: '#722ed1' }} />
      default:
        return <BellOutlined />
    }
  }

  const handleMarkAsRead = (id: number) => {
    console.log('Marcar como lida:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Deletar notificação:', id)
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#191970' }}>
          <BellOutlined style={{ marginRight: '12px' }} />
          Notificações
        </Title>
        <Text type="secondary">
          Gerencie suas notificações e mantenha-se atualizado
        </Text>
      </div>

      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(100, 149, 237, 0.05) 100%)',
          border: '1px solid rgba(25, 25, 112, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: item.read ? 'transparent' : 'rgba(25, 25, 112, 0.05)',
                  border: item.read ? 'none' : '1px solid rgba(25, 25, 112, 0.1)',
                  marginBottom: '8px'
                }}
                actions={[
                  <Button
                    key="read"
                    type="text"
                    icon={<CheckOutlined />}
                    onClick={() => handleMarkAsRead(item.id)}
                    disabled={item.read}
                  >
                    {item.read ? 'Lida' : 'Marcar como lida'}
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.id)}
                  >
                    Excluir
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.read}>
                      <Avatar
                        icon={getNotificationIcon(item.type)}
                        style={{
                          background: item.read ? '#f0f0f0' : '#191970'
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!item.read}>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.time}
                      </Text>
                    </Space>
                  }
                  description={item.message}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="Nenhuma notificação encontrada"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  )
}
