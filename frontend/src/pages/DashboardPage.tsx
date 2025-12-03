import React, { useState, useEffect } from 'react'
import { 
  Row, Col, Card, Statistic, Typography, Button, 
  Avatar, List, Tag, Space, Badge, Spin
} from 'antd'
import {
  FileTextOutlined, ClockCircleOutlined,
  CheckCircleOutlined, BellOutlined, 
  TrophyOutlined, RocketOutlined, BarChartOutlined,
  ArrowUpOutlined, DollarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMobile } from '../hooks/useMobile'
import { NativeMobileDashboardPage } from './mobile/NativeMobileDashboardPage'
import { dashboardService } from '../services/dashboardService'

const { Title, Text } = Typography

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mobile } = useMobile()

  // Carregar dados reais do dashboard
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Carregar apenas os dados que são realmente usados
      const [stats, activity] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(10)
      ])

      setDashboardStats(stats)
      setRecentActivity(activity || [])
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error)
      // Fallback para dados padrão em caso de erro
      setDashboardStats({
        totalProcesses: 0,
        activeProcesses: 0,
        completedTasks: 0,
        averageTime: 0,
        totalRevenue: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        teamMembers: 0
      })
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  // Usar versão mobile nativa (sem Ant Design)
  if (mobile) {
    return <NativeMobileDashboardPage />
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

  // Dados dinâmicos do dashboard
  const stats = dashboardStats ? [
    {
      title: 'Processos Ativos',
      value: dashboardStats.activeProcesses,
      prefix: <FileTextOutlined />,
      suffix: `de ${dashboardStats.totalProcesses} total`,
      trend: '+12%',
      trendDirection: 'up',
      color: '#00afee'
    },
    {
      title: 'Tarefas Concluídas',
      value: dashboardStats.completedTasks,
      prefix: <CheckCircleOutlined />,
      suffix: 'concluídas',
      trend: '+8%',
      trendDirection: 'up',
      color: '#52c41a'
    },
    {
      title: 'Tempo Médio',
      value: `${dashboardStats.averageTime} dias`,
      prefix: <ClockCircleOutlined />,
      suffix: 'por processo',
      trend: '-15%',
      trendDirection: 'down',
      color: '#faad14'
    },
    {
      title: 'Receita Total',
      value: `R$ ${dashboardStats.totalRevenue.toLocaleString('pt-BR')}`,
      prefix: <DollarOutlined />,
      suffix: 'total',
      trend: '+22%',
      trendDirection: 'up',
      color: '#722ed1'
    }
  ] : []

  // Formatar atividades recentes do backend
  const formatRecentActivities = () => {
    if (!recentActivity || recentActivity.length === 0) {
      return []
    }
    
    return recentActivity.map((activity, index) => {
      // Calcular tempo relativo
      const timestamp = new Date(activity.timestamp)
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      
      let timeAgo = ''
      if (diffMins < 1) {
        timeAgo = 'Agora'
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} min atrás`
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        timeAgo = `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
      }
      
      return {
        id: activity.id || index,
        user: activity.user || 'Sistema',
        action: activity.title || activity.description || 'Ação realizada',
        target: activity.description || '',
        time: timeAgo,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user || 'User')}&background=00afee&color=fff`,
        type: activity.status || 'info'
      }
    })
  }
  
  const recentActivities = formatRecentActivities()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, fontSize: '16px' }}>
          Carregando dados do dashboard...
        </Text>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              hoverable
              onClick={() => handleStatClick(stat.title)}
            >
              <Statistic
                title={
                  <Text style={{ 
                    color: '#666666',
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
                  color: '#000000',
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
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            title={
              <Space>
                <BellOutlined style={{ color: '#00afee' }} />
                <Title level={4} style={{ 
                  color: '#000000',
                  margin: 0
                }}>
                  Atividades Recentes
                </Title>
              </Space>
            }
          >
            {recentActivities.length > 0 ? (
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item style={{ 
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0'
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
                          <Text strong style={{ color: '#000000' }}>
                            {item.user}
                          </Text>
                          <Text style={{ color: '#666666' }}>
                            {item.action}
                          </Text>
                          {item.target && (
                            <Text style={{ color: '#00afee' }}>
                              {item.target}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Text style={{ color: '#999999' }}>
                          {item.time}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                Nenhuma atividade recente
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            title={
              <Space>
                <TrophyOutlined style={{ color: '#00afee' }} />
                <Title level={4} style={{ 
                  color: '#000000',
                  margin: 0
                }}>
                  Resumo Rápido
                </Title>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {dashboardStats && (
                <>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(0, 175, 238, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 175, 238, 0.1)'
                  }}>
                    <Text strong>Total de Processos</Text>
                    <Badge 
                      count={dashboardStats.totalProcesses || 0} 
                      style={{ 
                        backgroundColor: '#00afee',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(82, 196, 26, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(82, 196, 26, 0.1)'
                  }}>
                    <Text strong>Tarefas Concluídas</Text>
                    <Badge 
                      count={dashboardStats.completedTasks || 0} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(250, 173, 20, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(250, 173, 20, 0.1)'
                  }}>
                    <Text strong>Tarefas Pendentes</Text>
                    <Badge 
                      count={dashboardStats.pendingTasks || 0} 
                      style={{ 
                        backgroundColor: '#faad14',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                  {dashboardStats.overdueTasks > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(255, 77, 79, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 77, 79, 0.1)'
                    }}>
                      <Text strong>Tarefas Atrasadas</Text>
                      <Badge 
                        count={dashboardStats.overdueTasks || 0} 
                        style={{ 
                          backgroundColor: '#ff4d4f',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}