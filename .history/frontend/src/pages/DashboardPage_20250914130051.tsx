import React from 'react'
import { Row, Col, Card, Statistic, Progress, List, Avatar, Tag, Button, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckSquareOutlined,
  SendOutlined,
  BarChartOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export const DashboardPage: React.FC = () => {
  // Dados mockados para demonstração
  const stats = [
    {
      title: 'Total de Processos',
      value: 1247,
      icon: <FileTextOutlined />,
      color: '#1890ff',
      change: '+12%',
      changeType: 'increase' as const,
      suffix: ''
    },
    {
      title: 'Tarefas Concluídas',
      value: 89,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      change: '+8%',
      changeType: 'increase' as const,
      suffix: '%'
    },
    {
      title: 'Pendentes',
      value: 156,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      change: '-3%',
      changeType: 'decrease' as const,
      suffix: ''
    },
    {
      title: 'Receita Total',
      value: 125430,
      icon: <DollarOutlined />,
      color: '#722ed1',
      change: '+15%',
      changeType: 'increase' as const,
      suffix: 'R$',
      precision: 2
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'process',
      title: 'Processo 1001234-56.2024.8.26.0001 criado',
      description: 'Processo trabalhista - João Silva vs Empresa XYZ',
      time: '2 minutos atrás',
      user: 'Ana Santos',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      status: 'success'
    },
    {
      id: 2,
      type: 'task',
      title: 'Tarefa de cálculo concluída',
      description: 'Cálculo de rescisão - Processo 1001234-56.2024.8.26.0001',
      time: '15 minutos atrás',
      user: 'Carlos Lima',
      icon: <CheckSquareOutlined style={{ color: '#52c41a' }} />,
      status: 'success'
    },
    {
      id: 3,
      type: 'delivery',
      title: 'PDF entregue',
      description: 'Documento de cálculo enviado para o cliente',
      time: '1 hora atrás',
      user: 'Maria Costa',
      icon: <SendOutlined style={{ color: '#13c2c2' }} />,
      status: 'info'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Pagamento processado',
      description: 'R$ 2.500,00 pago ao parceiro Carlos Lima',
      time: '2 horas atrás',
      user: 'Sistema',
      icon: <DollarOutlined style={{ color: '#722ed1' }} />,
      status: 'success'
    }
  ]

  const urgentTasks = [
    {
      id: 1,
      title: 'Cálculo de rescisão - Processo 1001234-56.2024.8.26.0001',
      process: '1001234-56.2024.8.26.0001',
      dueDate: 'Hoje',
      assignee: 'Carlos Lima',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Análise de documentos - Processo 2001234-56.2024.8.26.0002',
      process: '2001234-56.2024.8.26.0002',
      dueDate: 'Amanhã',
      assignee: 'Ana Santos',
      priority: 'medium',
      status: 'in_progress'
    },
    {
      id: 3,
      title: 'Revisão de cálculos - Processo 3001234-56.2024.8.26.0003',
      process: '3001234-56.2024.8.26.0003',
      dueDate: 'Em 2 dias',
      assignee: 'Maria Costa',
      priority: 'low',
      status: 'pending'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success'
      case 'pending': return 'warning'
      case 'in_progress': return 'processing'
      case 'info': return 'default'
      default: return 'default'
    }
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Dashboard
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Visão geral do sistema de gestão de processos
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>
                    {stat.title}
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Statistic
                      value={stat.value}
                      suffix={stat.suffix}
                      precision={stat.precision}
                      valueStyle={{ 
                        color: stat.color, 
                        fontSize: '28px', 
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                    )}
                    <Text style={{ 
                      color: stat.changeType === 'increase' ? '#52c41a' : '#ff4d4f',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {stat.change} vs mês anterior
                    </Text>
                  </div>
                </div>
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}40 100%)`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts and Lists */}
      <Row gutter={[24, 24]}>
        {/* Performance Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChartOutlined style={{ color: '#031f5f' }} />
                <span>Performance do Mês</span>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
            extra={
              <Button type="text" size="small">
                Ver detalhes
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 24px',
                  position: 'relative'
                }}
              >
                <Progress
                  type="circle"
                  percent={75}
                  strokeWidth={8}
                  strokeColor={{
                    '0%': '#031f5f',
                    '100%': '#00afee',
                  }}
                  trailColor="#f0f0f0"
                  size={120}
                  format={() => (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#031f5f' }}>
                        75%
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Concluído
                      </div>
                    </div>
                  )}
                />
              </div>
              <Title level={4} style={{ margin: '0 0 8px', color: '#031f5f' }}>
                Meta Mensal Atingida
              </Title>
              <Text style={{ color: '#666' }}>
                Você completou 75% das tarefas planejadas para este mês
              </Text>
            </div>
          </Card>
        </Col>

        {/* Urgent Tasks */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                <span>Tarefas Urgentes</span>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
            extra={
              <Button type="text" size="small">
                Ver todas
              </Button>
            }
          >
            <List
              dataSource={urgentTasks}
              renderItem={(task) => (
                <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '14px', lineHeight: 1.4 }}>
                        {task.title}
                      </Text>
                      <Tag color={getPriorityColor(task.priority)} size="small">
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {task.process}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        •
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {task.dueDate}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar size={20} icon={<UserOutlined />} />
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {task.assignee}
                      </Text>
                      <Tag color={getStatusColor(task.status)} size="small" style={{ marginLeft: 'auto' }}>
                        {task.status === 'pending' ? 'Pendente' : task.status === 'in_progress' ? 'Em Andamento' : 'Concluída'}
                      </Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#031f5f' }} />
                <span>Atividade Recente</span>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
            extra={
              <Button type="text" size="small">
                Ver todas
              </Button>
            }
          >
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={40} 
                        icon={activity.icon}
                        style={{ background: '#f0f0f0' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: '14px' }}>
                          {activity.title}
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          {activity.time}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                          {activity.description}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar size={16} icon={<UserOutlined />} />
                          <Text style={{ fontSize: '12px', color: '#666' }}>
                            {activity.user}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquareOutlined style={{ color: '#52c41a' }} />
                <span>Ações Rápidas</span>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                type="primary" 
                block 
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                <FileTextOutlined /> Novo Processo
              </Button>
              
              <Button 
                block 
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  fontWeight: 600
                }}
              >
                <CheckSquareOutlined /> Nova Tarefa
              </Button>
              
              <Button 
                block 
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  fontWeight: 600
                }}
              >
                <SendOutlined /> Enviar Entrega
              </Button>
              
              <Button 
                block 
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  fontWeight: 600
                }}
              >
                <DollarOutlined /> Processar Pagamento
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}