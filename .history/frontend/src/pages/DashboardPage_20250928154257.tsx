import React, { useState } from 'react'
import { 
  Row, Col, Card, Statistic, Typography, Button, 
  Avatar, List, Tag, Space, Badge, Progress
} from 'antd'
import {
  UserOutlined, FileTextOutlined, ClockCircleOutlined,
  CheckCircleOutlined, RiseOutlined, BellOutlined, 
  TrophyOutlined, RocketOutlined, BarChartOutlined,
  ArrowUpOutlined, DollarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMobile } from '../hooks/useMobile'
import { MobileDashboardPage } from './mobile/MobileDashboardPage'

const { Title, Text } = Typography

export const DashboardPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mobile } = useMobile()

  // Usar versão mobile específica
  if (mobile) {
    return <MobileDashboardPage />
  }

  const handleComecarAgora = () => {
    navigate('/processes')
  }

  const handleVerRelatorios = () => {
    navigate('/reports')
  }

  const handleStatClick = (title: string) => {
    switch (title) {
      case 'Processos Ativos':
        navigate('/processes')
        break
      case 'Tarefas Concluídas':
        navigate('/tasks')
        break
      case 'Tempo Médio':
        navigate('/timeline')
        break
      case 'Receita Total':
        navigate('/financial')
        break
      default:
        break
    }
  }

  // Dados estáticos para o dashboard
  const stats = [
    {
      title: 'Processos Ativos',
      value: 28,
      prefix: <FileTextOutlined />,
      suffix: '',
      trend: '+12%',
      trendDirection: 'up',
      color: '#00afee'
    },
    {
      title: 'Tarefas Concluídas',
      value: 156,
      prefix: <CheckCircleOutlined />,
      suffix: '',
      trend: '+8%',
      trendDirection: 'up',
      color: '#52c41a'
    },
    {
      title: 'Tempo Médio',
      value: '2.5h',
      prefix: <ClockCircleOutlined />,
      suffix: '',
      trend: '-15%',
      trendDirection: 'down',
      color: '#faad14'
    },
    {
      title: 'Receita Total',
      value: 'R$ 125k',
      prefix: <DollarOutlined />,
      suffix: '',
      trend: '+22%',
      trendDirection: 'up',
      color: '#722ed1'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      user: 'João Silva',
      action: 'Concluiu o processo',
      target: 'Processo #2024-001',
      time: '2 min atrás',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      type: 'success'
    },
    {
      id: 2,
      user: 'Maria Santos',
      action: 'Criou nova tarefa',
      target: 'Revisão de Contrato',
      time: '15 min atrás',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      type: 'info'
    },
    {
      id: 3,
      user: 'Pedro Costa',
      action: 'Adicionou arquivo',
      target: 'Documento Legal.pdf',
      time: '1 hora atrás',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      type: 'warning'
    },
    {
      id: 4,
      user: 'Ana Oliveira',
      action: 'Atualizou status',
      target: 'Processo #2024-003',
      time: '2 horas atrás',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      type: 'success'
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh',
      background: darkMode 
        ? 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #031f5f 0%, #00afee 50%, #ca00ca 100%)',
        borderRadius: '20px',
        padding: '48px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Title level={1} style={{ 
              color: 'white', 
              marginBottom: '16px',
              fontSize: window.innerWidth < 768 ? '32px' : '48px',
              fontWeight: '700',
              lineHeight: 1.2
            }}>
              Bem-vindo ao Sistema
              <br />
              <span style={{ 
                background: 'linear-gradient(45deg, #ccff00, #00afee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Jurídico Inteligente
              </span>
            </Title>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '18px',
              display: 'block',
              marginBottom: '24px'
            }}>
              Olá, {user?.full_name || user?.username}! Gerencie seus processos jurídicos com inteligência
            </Text>
            <Space>
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />}
                onClick={handleComecarAgora}
                style={{
                  background: 'linear-gradient(45deg, #ccff00, #00afee)',
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 32px',
                  fontWeight: '600'
                }}
              >
                Começar Agora
              </Button>
              <Button 
                size="large"
                icon={<BarChartOutlined />}
                onClick={handleVerRelatorios}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 32px'
                }}
              >
                Ver Relatórios
              </Button>
            </Space>
          </Col>
          <Col xs={24} lg={6} style={{ textAlign: 'center' }}>
            <div style={{
              width: window.innerWidth < 768 ? '150px' : '200px',
              height: window.innerWidth < 768 ? '150px' : '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              margin: '0 auto'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=300&fit=crop" 
                alt="Professional Office"
                style={{
                  width: window.innerWidth < 768 ? '130px' : '180px',
                  height: window.innerWidth < 768 ? '130px' : '180px',
                  borderRadius: '16px',
                  objectFit: 'cover'
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: '16px',
                background: darkMode 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: darkMode
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              hoverable
              onClick={() => handleStatClick(stat.title)}
            >
              <Statistic
                title={
                  <Text style={{ 
                    color: darkMode ? '#ffffff' : '#666666',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {stat.title}
                  </Text>
                }
                value={stat.value}
                prefix={
                  <span style={{ 
                    color: stat.color,
                    fontSize: '24px',
                    marginRight: '8px'
                  }}>
                    {stat.prefix}
                  </span>
                }
                suffix={stat.suffix}
                valueStyle={{ 
                  color: darkMode ? '#ffffff' : '#000000',
                  fontSize: '28px',
                  fontWeight: '700'
                }}
              />
              <div style={{ 
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Tag 
                  color={stat.trendDirection === 'up' ? 'green' : 'red'}
                  icon={<ArrowUpOutlined />}
                  style={{ 
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  {stat.trend}
                </Tag>
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                  borderRadius: '2px'
                }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activities */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '16px',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: darkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: darkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            title={
              <Space>
                <BellOutlined style={{ color: '#00afee' }} />
                <Title level={4} style={{ 
                  color: darkMode ? '#ffffff' : '#000000',
                  margin: 0
                }}>
                  Atividades Recentes
                </Title>
              </Space>
            }
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item style={{ 
                  padding: '16px 0',
                  borderBottom: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`
                }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={item.avatar}
                        size={48}
                        style={{ 
                          border: `2px solid ${item.type === 'success' ? '#52c41a' : item.type === 'warning' ? '#faad14' : '#1890ff'}`
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                          {item.user}
                        </Text>
                        <Text style={{ color: darkMode ? '#cccccc' : '#666666' }}>
                          {item.action}
                        </Text>
                        <Text style={{ color: '#00afee' }}>
                          {item.target}
                        </Text>
                      </Space>
                    }
                    description={
                      <Text style={{ color: darkMode ? '#999999' : '#999999' }}>
                        {item.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '16px',
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: darkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: darkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            title={
              <Space>
                <TrophyOutlined style={{ color: '#00afee' }} />
                <Title level={4} style={{ 
                  color: darkMode ? '#ffffff' : '#000000',
                  margin: 0
                }}>
                  Top Performers
                </Title>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {[
                { name: 'João Silva', score: 95, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', badge: '🥇' },
                { name: 'Maria Santos', score: 88, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', badge: '🥈' },
                { name: 'Pedro Costa', score: 82, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', badge: '🥉' },
                { name: 'Ana Oliveira', score: 76, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', badge: '⭐' }
              ].map((performer, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 175, 238, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 175, 238, 0.1)'}`
                }}>
                  <Space>
                    <span style={{ fontSize: '24px' }}>{performer.badge}</span>
                    <Avatar src={performer.avatar} size={40} />
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                        {performer.name}
                      </Text>
                      <br />
                      <Progress 
                        percent={performer.score} 
                        size="small" 
                        strokeColor="#00afee"
                        showInfo={false}
                        style={{ width: '100px' }}
                      />
                    </div>
                  </Space>
                  <Badge 
                    count={performer.score} 
                    style={{ 
                      backgroundColor: '#00afee',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}