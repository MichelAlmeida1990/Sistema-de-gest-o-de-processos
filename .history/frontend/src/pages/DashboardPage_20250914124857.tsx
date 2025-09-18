import React from 'react'
import { Row, Col, Card, Statistic, Typography, Space } from 'antd'
import { 
  FileTextOutlined, 
  CalculatorOutlined, 
  CheckCircleOutlined, 
  DollarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const { Title } = Typography

export const DashboardPage: React.FC = () => {
  // TODO: Implementar dados reais da API
  const stats = {
    totalProcesses: 150,
    activeProcesses: 120,
    totalTasks: 300,
    pendingTasks: 45,
    completedTasks: 255,
    totalUsers: 25,
    activeUsers: 20,
    totalPayments: 50000.00,
    pendingPayments: 15000.00
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          Dashboard
        </Title>
        <p className="dashboard-subtitle">
          Visão geral do sistema de gestão de processos
        </p>
      </div>

      <Row gutter={[24, 24]} className="dashboard-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total de Processos"
              value={stats.totalProcesses}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: 'var(--color-primary)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Processos Ativos"
              value={stats.activeProcesses}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: 'var(--color-success)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total de Tarefas"
              value={stats.totalTasks}
              prefix={<CalculatorOutlined />}
              valueStyle={{ color: 'var(--color-info)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tarefas Concluídas"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: 'var(--color-success)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tarefas Pendentes"
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: 'var(--color-warning)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total de Usuários"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: 'var(--color-primary)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Usuários Ativos"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: 'var(--color-success)' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Valor Total"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: 'var(--color-success)' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-charts">
        <Col xs={24} lg={12}>
          <Card title="Tarefas por Status" className="chart-card">
            <div className="chart-placeholder">
              <p>Gráfico de tarefas por status será implementado aqui</p>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Pagamentos por Mês" className="chart-card">
            <div className="chart-placeholder">
              <p>Gráfico de pagamentos será implementado aqui</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-recent">
        <Col xs={24} lg={12}>
          <Card title="Atividade Recente" className="activity-card">
            <div className="activity-list">
              <div className="activity-item">
                <CheckCircleOutlined className="activity-icon success" />
                <div className="activity-content">
                  <p className="activity-title">Tarefa concluída</p>
                  <p className="activity-description">Cálculo de Pensão Alimentícia - Processo 0000001-23.2024.8.26.0100</p>
                  <p className="activity-time">Há 2 horas</p>
                </div>
              </div>
              
              <div className="activity-item">
                <FileTextOutlined className="activity-icon primary" />
                <div className="activity-content">
                  <p className="activity-title">Novo processo cadastrado</p>
                  <p className="activity-description">Processo 0000002-23.2024.8.26.0100</p>
                  <p className="activity-time">Há 4 horas</p>
                </div>
              </div>
              
              <div className="activity-item">
                <UserOutlined className="activity-icon info" />
                <div className="activity-content">
                  <p className="activity-title">Novo usuário cadastrado</p>
                  <p className="activity-description">Maria Calculista</p>
                  <p className="activity-time">Ontem</p>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Tarefas Próximas do Vencimento" className="tasks-card">
            <div className="tasks-list">
              <div className="task-item urgent">
                <ClockCircleOutlined className="task-icon" />
                <div className="task-content">
                  <p className="task-title">Cálculo de Danos Morais</p>
                  <p className="task-process">Processo: 0000003-23.2024.8.26.0100</p>
                  <p className="task-due">Vence em 2 dias</p>
                </div>
              </div>
              
              <div className="task-item warning">
                <ClockCircleOutlined className="task-icon" />
                <div className="task-content">
                  <p className="task-title">Cálculo de Pensão</p>
                  <p className="task-process">Processo: 0000004-23.2024.8.26.0100</p>
                  <p className="task-due">Vence em 5 dias</p>
                </div>
              </div>
              
              <div className="task-item normal">
                <ClockCircleOutlined className="task-icon" />
                <div className="task-content">
                  <p className="task-title">Cálculo de FGTS</p>
                  <p className="task-process">Processo: 0000005-23.2024.8.26.0100</p>
                  <p className="task-due">Vence em 10 dias</p>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  )
}

