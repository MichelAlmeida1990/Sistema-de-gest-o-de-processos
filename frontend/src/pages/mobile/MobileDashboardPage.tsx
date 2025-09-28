// ===========================================
// DASHBOARD MOBILE ESPECÍFICO
// ===========================================

import React from 'react'
import { Row, Col, Statistic, Typography, Space, Button } from 'antd'
import { 
  RiseOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  PlusOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MobileCard } from '../../components/mobile/MobileCard'

const { Title, Text } = Typography

export const MobileDashboardPage: React.FC = () => {
  const navigate = useNavigate()

  const stats = [
    {
      title: 'Processos Ativos',
      value: 12,
      icon: '📋',
      color: '#1890ff',
      onClick: () => navigate('/processes')
    },
    {
      title: 'Tarefas Concluídas',
      value: 8,
      icon: '✅',
      color: '#52c41a',
      onClick: () => navigate('/tasks')
    },
    {
      title: 'Tempo Médio',
      value: '2.5h',
      icon: '⏰',
      color: '#faad14',
      onClick: () => navigate('/timeline')
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.2k',
      icon: '💰',
      color: '#722ed1',
      onClick: () => navigate('/financial')
    }
  ]

  const recentActivities = [
    {
      title: 'Processo Criado',
      description: 'Novo processo trabalhista cadastrado no sistema',
      status: 'Processo',
      user: 'Ana Santos',
      date: '15/01/2024 08:00',
      icon: '📋'
    },
    {
      title: 'Tarefa de Cálculo Criada',
      description: 'Cálculo de rescisão trabalhista - análise de documentos',
      status: 'Tarefa',
      user: 'Carlos Lima',
      date: '15/01/2024 10:30',
      icon: '🧮'
    },
    {
      title: 'Comentário Adicionado',
      description: 'Novo comentário no processo 1001234-56.2024.8.26.0001',
      status: 'Comentário',
      user: 'Maria Silva',
      date: '15/01/2024 14:15',
      icon: '💬'
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Title level={2} style={{ 
          margin: 0, 
          fontSize: '24px',
          fontWeight: '600',
          color: '#333'
        }}>
          Dashboard
        </Title>
        <Text style={{ color: '#666', fontSize: '14px' }}>
          Visão geral do sistema
        </Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col span={12} key={index}>
            <div
              onClick={stat.onClick}
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>
                  {stat.icon}
                </span>
                <Text style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {stat.title}
                </Text>
              </div>
              <Text style={{
                fontSize: '24px',
                fontWeight: '700',
                color: stat.color,
                display: 'block'
              }}>
                {stat.value}
              </Text>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ 
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Ações Rápidas
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/processes')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Novo Processo
          </Button>
          
          <Button
            size="large"
            icon={<BarChartOutlined />}
            onClick={() => navigate('/reports')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Ver Relatórios
          </Button>
        </Space>
      </div>

      {/* Recent Activities */}
      <div>
        <Title level={4} style={{ 
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Atividades Recentes
        </Title>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentActivities.map((activity, index) => (
            <MobileCard
              key={index}
              title={activity.title}
              description={activity.description}
              status={activity.status}
              user={activity.user}
              date={activity.date}
              icon={activity.icon}
              onClick={() => navigate('/processes')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
