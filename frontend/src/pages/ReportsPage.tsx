import React, { useState } from 'react'
import { 
  Row, Col, Card, Button, Select, Typography, DatePicker, Space, 
  Table, Statistic, Progress, Tag, Divider, Tabs, Modal, message,
  Tooltip, Avatar, Badge, List
} from 'antd'
import {
  DownloadOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined,
  BarChartOutlined, PieChartOutlined, LineChartOutlined, TableOutlined,
  CalendarOutlined, UserOutlined, DollarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, RiseOutlined,
  FallOutlined, EyeOutlined, FilterOutlined, FileOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { reportExportService } from '../services/reportExportService'
import { dashboardService } from '../services/dashboardService'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs

// Interfaces
interface ReportData {
  id: string
  title: string
  type: 'productivity' | 'financial' | 'process' | 'user'
  period: string
  generatedAt: string
  generatedBy: string
  status: 'completed' | 'processing' | 'failed'
}

interface ProductivityMetrics {
  totalTasks: number
  completedTasks: number
  averageCompletionTime: number
  overdueTasks: number
  userProductivity: Array<{
    user: string
    tasksCompleted: number
    averageTime: number
    efficiency: number
  }>
}

interface FinancialMetrics {
  totalRevenue: number
  totalPayments: number
  pendingPayments: number
  averagePaymentValue: number
  paymentTrends: Array<{
    month: string
    amount: number
    count: number
  }>
}

interface ProcessMetrics {
  totalProcesses: number
  completedProcesses: number
  averageProcessDuration: number
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
}

// Dados mockados
const reportsData: ReportData[] = [
  {
    id: '1',
    title: 'Relatório de Produtividade - Janeiro 2024',
    type: 'productivity',
    period: '2024-01-01 a 2024-01-31',
    generatedAt: '2024-01-31T18:00:00',
    generatedBy: 'Ana Santos',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Análise Financeira - Q1 2024',
    type: 'financial',
    period: '2024-01-01 a 2024-03-31',
    generatedAt: '2024-03-31T17:30:00',
    generatedBy: 'Carlos Lima',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Relatório de Processos - Março 2024',
    type: 'process',
    period: '2024-03-01 a 2024-03-31',
    generatedAt: '2024-03-31T16:45:00',
    generatedBy: 'Maria Silva',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Análise de Usuários - Q1 2024',
    type: 'user',
    period: '2024-01-01 a 2024-03-31',
    generatedAt: '2024-03-31T15:20:00',
    generatedBy: 'João Oliveira',
    status: 'completed'
  }
]

const productivityMetrics: ProductivityMetrics = {
  totalTasks: 150,
  completedTasks: 120,
  averageCompletionTime: 2.5,
  overdueTasks: 8,
  userProductivity: [
    { user: 'Ana Santos', tasksCompleted: 35, averageTime: 2.1, efficiency: 95 },
    { user: 'Carlos Lima', tasksCompleted: 28, averageTime: 2.8, efficiency: 88 },
    { user: 'Maria Silva', tasksCompleted: 32, averageTime: 2.3, efficiency: 92 },
    { user: 'João Oliveira', tasksCompleted: 25, averageTime: 3.1, efficiency: 85 }
  ]
}

const financialMetrics: FinancialMetrics = {
  totalRevenue: 125000,
  totalPayments: 98000,
  pendingPayments: 27000,
  averagePaymentValue: 2500,
  paymentTrends: [
    { month: 'Jan', amount: 35000, count: 14 },
    { month: 'Fev', amount: 42000, count: 16 },
    { month: 'Mar', amount: 48000, count: 18 }
  ]
}

const processMetrics: ProcessMetrics = {
  totalProcesses: 89,
  completedProcesses: 67,
  averageProcessDuration: 18.5,
  statusDistribution: [
    { status: 'Concluído', count: 67, percentage: 75.3 },
    { status: 'Em Andamento', count: 15, percentage: 16.9 },
    { status: 'Pendente', count: 7, percentage: 7.8 }
  ]
}

// Componente de botão isolado
interface GenerateReportButtonProps {
  onReportGenerated?: () => Promise<void>
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ onReportGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClick = async () => {
    if (isGenerating) {
      console.log('🚫 Botão bloqueado - geração em andamento')
      return
    }

    console.log('🚀 Iniciando geração de relatório...')
    setIsGenerating(true)

    try {
      // Notificar o componente pai que o relatório foi gerado
      if (onReportGenerated) {
        await onReportGenerated()
      }
      
      console.log('✅ Relatório gerado com sucesso')
      message.success('Relatório gerado com sucesso! Dados atualizados com informações do backend.')
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error)
      message.error('Erro ao gerar relatório. Usando dados de exemplo.')
    } finally {
      setIsGenerating(false)
      console.log('🏁 Geração de relatório finalizada')
    }
  }

  return (
    <Button
      type="primary"
      icon={<BarChartOutlined />}
      onClick={handleClick}
      loading={isGenerating}
      disabled={isGenerating}
      style={{
        borderRadius: '12px',
        background: isGenerating
          ? 'linear-gradient(135deg, #6c7b95 0%, #5a6b7d 100%)'
          : 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
        border: 'none',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        pointerEvents: isGenerating ? 'none' : 'auto'
      }}
    >
      {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
    </Button>
  )
}

// Componente principal
export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedReportType, setSelectedReportType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isExportModalVisible, setIsExportModalVisible] = useState(false)
  const [lastReportGenerated, setLastReportGenerated] = useState<Date | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  // Estados para dados reais do backend
  const [realDashboardStats, setRealDashboardStats] = useState<any>(null)
  const [realProcesses, setRealProcesses] = useState<any[]>([])
  const [realTasks, setRealTasks] = useState<any[]>([])

  const handleReportGenerated = async () => {
    setLastReportGenerated(new Date())
    console.log('📊 Relatório gerado em:', new Date().toLocaleString('pt-BR'))
    
    // Buscar dados reais do backend
    await loadReportData()
  }

  const loadReportData = async () => {
    setIsLoadingData(true)
    try {
      console.log('🔄 Buscando dados reais do backend...')
      
      // Buscar dados do dashboard
      const [stats, processes, tasks] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getProcessSummary(10),
        dashboardService.getTaskSummary(10)
      ])

      setRealDashboardStats(stats)
      setRealProcesses(processes)
      setRealTasks(tasks)
      
      console.log('✅ Dados carregados com sucesso:', {
        stats,
        processes: processes.length,
        tasks: tasks.length
      })
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do backend:', error)
      message.warning('Usando dados de exemplo. Erro ao conectar com o backend.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      console.log(`🚀 Iniciando exportação para ${format.toUpperCase()}...`)
      
      // Verificar se o usuário está logado
      const token = localStorage.getItem('token')
      if (!token || token === 'undefined' || token === 'null') {
        console.log('❌ Usuário não está logado. Redirecionando para login...')
        message.warning('Você precisa fazer login para exportar relatórios.')
        window.location.href = '/login'
        return
      }
      
      console.log('✅ Usuário logado. Token encontrado:', token.substring(0, 20) + '...')
      
      // Verificar se o relatório foi gerado
      if (!lastReportGenerated) {
        message.warning('Por favor, gere o relatório antes de exportar.')
        console.log('⚠️ Tentativa de exportar sem gerar relatório')
        return
      }
      
      // Verificar se há dados disponíveis
      const hasRealData = realDashboardStats !== null || realProcesses.length > 0 || realTasks.length > 0
      
      if (!hasRealData) {
        message.warning('Gerando dados do relatório... Por favor, aguarde.')
        console.log('⚠️ Aguardando carregamento dos dados do backend')
        await loadReportData()
      }
      
      // Preparar parâmetros de exportação com dados reais
      const exportParams = {
        reportType: selectedReportType,
        startDate: dateRange ? dateRange[0]?.format('YYYY-MM-DD') : undefined,
        endDate: dateRange ? dateRange[1]?.format('YYYY-MM-DD') : undefined,
        userIds: selectedUsers.length > 0 ? selectedUsers : undefined,
        // Incluir dados reais do backend
        dashboardStats: realDashboardStats,
        processes: realProcesses,
        tasks: realTasks,
        generatedAt: lastReportGenerated.toISOString()
      }
      
      console.log('📋 Parâmetros de exportação com dados reais:', {
        ...exportParams,
        dashboardStats: realDashboardStats ? '✅ Carregado' : '❌ Não disponível',
        processes: `${realProcesses.length} processos`,
        tasks: `${realTasks.length} tarefas`
      })
      
      if (format === 'pdf') {
        await reportExportService.exportToPDF(exportParams)
        message.success(`Relatório PDF exportado com ${realProcesses.length} processos!`)
      } else if (format === 'excel') {
        const result = await reportExportService.exportToExcel(exportParams)
        message.success(`Relatório Excel exportado: ${result.filename}`)
      } else if (format === 'csv') {
        const result = await reportExportService.exportToCSV(exportParams)
        message.success(`Relatório CSV exportado: ${result.filename}`)
      }
      
      setIsExportModalVisible(false)
      console.log(`✅ Exportação para ${format.toUpperCase()} concluída com sucesso`)
      console.log(`📊 Dados exportados: ${realProcesses.length} processos, ${realTasks.length} tarefas`)
      
    } catch (error: any) {
      console.error(`❌ Erro ao exportar ${format.toUpperCase()}:`, error)
      message.error(`Erro ao exportar relatório: ${error.message || 'Erro desconhecido'}`)
    }
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
        📊 Relatórios e Análises
      </Title>

      {/* Filtros e Controles */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none',
          marginBottom: '24px'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Período</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Data inicial', 'Data final']}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Tipo de Relatório</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedReportType}
                onChange={setSelectedReportType}
                placeholder="Selecione o tipo"
              >
                <Option value="all">Todos</Option>
                <Option value="productivity">Produtividade</Option>
                <Option value="financial">Financeiro</Option>
                <Option value="process">Processos</Option>
                <Option value="user">Usuários</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Usuários</Text>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                value={selectedUsers}
                onChange={setSelectedUsers}
                placeholder="Selecione usuários"
              >
                <Option value="Ana Santos">Ana Santos</Option>
                <Option value="Carlos Lima">Carlos Lima</Option>
                <Option value="Maria Silva">Maria Silva</Option>
                <Option value="João Oliveira">João Oliveira</Option>
                <Option value="Roberto Silva">Roberto Silva</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <GenerateReportButton onReportGenerated={handleReportGenerated} />
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => setIsExportModalVisible(true)}
                  disabled={!lastReportGenerated}
                  style={{ 
                    borderRadius: '12px',
                    background: lastReportGenerated 
                      ? 'linear-gradient(135deg, #20b2aa 0%, #1a9b94 100%)'
                      : 'linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: lastReportGenerated ? 'pointer' : 'not-allowed'
                  }}
                >
                  Exportar
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    const token = localStorage.getItem('token')
                    if (!token || token === 'undefined') {
                      message.warning('Token não encontrado! Faça login primeiro.')
                      window.location.href = '/login'
                    } else {
                      message.success('Token válido encontrado!')
                      console.log('🔑 Token:', token.substring(0, 30) + '...')
                    }
                  }}
                  style={{ 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                >
                  🔍 Verificar Token
                </Button>
              </Space>
              {lastReportGenerated && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Último relatório: {lastReportGenerated.toLocaleTimeString('pt-BR')}
                  </Text>
                  {(realProcesses.length > 0 || realTasks.length > 0) && (
                    <Text type="success" style={{ fontSize: '11px' }}>
                      ✅ {realProcesses.length} processos • {realTasks.length} tarefas
                    </Text>
                  )}
                </Space>
              )}
              {!lastReportGenerated && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ⚠️ Gere um relatório primeiro
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Informação sobre o relatório */}
      {lastReportGenerated && (
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: 'none',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)'
          }}
          styles={{ body: { padding: '16px' } }}
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <div>
              <Text strong style={{ color: '#1890ff' }}>Relatório gerado com sucesso!</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Gerado em: {lastReportGenerated.toLocaleString('pt-BR')} • 
                Tipo: {selectedReportType === 'all' ? 'Todos' : selectedReportType} • 
                Período: {dateRange ? `${dateRange[0]?.format('DD/MM/YYYY')} - ${dateRange[1]?.format('DD/MM/YYYY')}` : 'Não especificado'}
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Tabs de Relatórios */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'dashboard',
              label: (
                <span>
                  <BarChartOutlined />
                  Dashboard
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  {/* Métricas Principais */}
                  <Col span={24}>
                    <Card 
                      title="Métricas Principais" 
                      style={{ borderRadius: '16px' }}
                      extra={
                        realDashboardStats && (
                          <Tag color="green">Dados Reais</Tag>
                        )
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                            <Statistic
                              title="Total de Processos"
                              value={realDashboardStats?.totalProcesses || productivityMetrics.totalTasks}
                              prefix={<FileOutlined style={{ color: '#722ed1' }} />}
                              loading={isLoadingData}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                            <Statistic
                              title="Processos Ativos"
                              value={realDashboardStats?.activeProcesses || productivityMetrics.completedTasks}
                              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                              loading={isLoadingData}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                            <Statistic
                              title="Tarefas Concluídas"
                              value={realDashboardStats?.completedTasks || productivityMetrics.completedTasks}
                              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                              loading={isLoadingData}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                            <Statistic
                              title="Tempo Médio (dias)"
                              value={realDashboardStats?.averageTime || productivityMetrics.averageCompletionTime}
                              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                              loading={isLoadingData}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Produtividade por Usuário */}
                  <Col xs={24} lg={12}>
                    <Card title="Produtividade por Usuário" style={{ borderRadius: '16px' }}>
                      <Table
                        dataSource={productivityMetrics.userProductivity}
                        pagination={false}
                        size="small"
                        rowKey="user"
                        columns={[
                          {
                            title: 'Usuário',
                            dataIndex: 'user',
                            key: 'user',
                            render: (text) => (
                              <Space>
                                <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                  {text.charAt(0)}
                                </Avatar>
                                {text}
                              </Space>
                            )
                          },
                          {
                            title: 'Tarefas',
                            dataIndex: 'tasksCompleted',
                            key: 'tasksCompleted',
                            align: 'center'
                          },
                          {
                            title: 'Eficiência',
                            dataIndex: 'efficiency',
                            key: 'efficiency',
                            align: 'center',
                            render: (value) => (
                              <Progress
                                percent={value}
                                size="small"
                                status={value >= 90 ? 'success' : value >= 80 ? 'normal' : 'exception'}
                              />
                            )
                          }
                        ]}
                      />
                    </Card>
                  </Col>

                  {/* Resumo Financeiro */}
                  <Col xs={24} lg={12}>
                    <Card 
                      title="Resumo Financeiro" 
                      style={{ borderRadius: '16px' }}
                      extra={
                        realDashboardStats && (
                          <Tag color="green">Dados Reais</Tag>
                        )
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic
                            title="Receita Total"
                            value={realDashboardStats?.totalRevenue || financialMetrics.totalRevenue}
                            prefix="R$"
                            valueStyle={{ color: '#52c41a' }}
                            loading={isLoadingData}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Tarefas Pendentes"
                            value={realDashboardStats?.pendingTasks || financialMetrics.pendingPayments}
                            valueStyle={{ color: '#ff4d4f' }}
                            loading={isLoadingData}
                          />
                        </Col>
                      </Row>
                      <Divider />
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic
                            title="Tarefas Atrasadas"
                            value={realDashboardStats?.overdueTasks || productivityMetrics.overdueTasks}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                            loading={isLoadingData}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Membros da Equipe"
                            value={realDashboardStats?.teamMembers || 4}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            loading={isLoadingData}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Status dos Processos */}
                  <Col span={24}>
                    <Card 
                      title="Processos Recentes" 
                      style={{ borderRadius: '16px' }}
                      extra={
                        realProcesses.length > 0 && (
                          <Tag color="green">Dados Reais ({realProcesses.length} processos)</Tag>
                        )
                      }
                    >
                      {realProcesses.length > 0 ? (
                        <Table
                          dataSource={realProcesses}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          loading={isLoadingData}
                          columns={[
                            {
                              title: 'Número',
                              dataIndex: 'number',
                              key: 'number',
                              render: (text) => <Text strong>{text}</Text>
                            },
                            {
                              title: 'Título',
                              dataIndex: 'title',
                              key: 'title'
                            },
                            {
                              title: 'Status',
                              dataIndex: 'status',
                              key: 'status',
                              render: (status) => {
                                const colors: Record<string, string> = {
                                  'Em Andamento': 'blue',
                                  'Concluído': 'green',
                                  'Pendente': 'orange',
                                  'Cancelado': 'red'
                                }
                                return <Tag color={colors[status] || 'default'}>{status}</Tag>
                              }
                            },
                            {
                              title: 'Prioridade',
                              dataIndex: 'priority',
                              key: 'priority',
                              render: (priority) => {
                                const colors: Record<string, string> = {
                                  'Alta': 'red',
                                  'Média': 'orange',
                                  'Baixa': 'green'
                                }
                                return <Tag color={colors[priority] || 'default'}>{priority}</Tag>
                              }
                            }
                          ]}
                        />
                      ) : (
                        <Row gutter={[16, 16]}>
                          {processMetrics.statusDistribution.map((item) => (
                            <Col xs={24} sm={8} key={item.status}>
                              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                                <Statistic
                                  title={item.status}
                                  value={item.count}
                                  suffix={`(${item.percentage}%)`}
                                  prefix={
                                    item.status === 'Concluído' ? (
                                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    ) : item.status === 'Em Andamento' ? (
                                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    ) : (
                                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                                    )
                                  }
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'productivity',
              label: (
                <span>
                  <UserOutlined />
                  Produtividade
                </span>
              ),
              children: (
                <Card title="Relatório de Produtividade" style={{ borderRadius: '16px' }}>
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      <Table
                        dataSource={productivityMetrics.userProductivity}
                        pagination={false}
                        rowKey="user"
                        columns={[
                          {
                            title: 'Usuário',
                            dataIndex: 'user',
                            key: 'user',
                            render: (text) => (
                              <Space>
                                <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                  {text.charAt(0)}
                                </Avatar>
                                {text}
                              </Space>
                            )
                          },
                          {
                            title: 'Tarefas Concluídas',
                            dataIndex: 'tasksCompleted',
                            key: 'tasksCompleted',
                            align: 'center'
                          },
                          {
                            title: 'Tempo Médio (dias)',
                            dataIndex: 'averageTime',
                            key: 'averageTime',
                            align: 'center'
                          },
                          {
                            title: 'Eficiência',
                            dataIndex: 'efficiency',
                            key: 'efficiency',
                            align: 'center',
                            render: (value) => (
                              <Progress
                                percent={value}
                                size="small"
                                status={value >= 90 ? 'success' : value >= 80 ? 'normal' : 'exception'}
                              />
                            )
                          }
                        ]}
                      />
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'financial',
              label: (
                <span>
                  <DollarOutlined />
                  Financeiro
                </span>
              ),
              children: (
                <Card title="Relatório Financeiro" style={{ borderRadius: '16px' }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Card title="Resumo Financeiro" style={{ borderRadius: '12px' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                          <div>
                            <Text strong>Receita Total</Text>
                            <Title level={3} style={{ margin: '8px 0', color: '#52c41a' }}>
                              R$ {financialMetrics.totalRevenue.toLocaleString('pt-BR')}
                            </Title>
                          </div>
                          <div>
                            <Text strong>Pagamentos Realizados</Text>
                            <Title level={4} style={{ margin: '8px 0', color: '#1890ff' }}>
                              R$ {financialMetrics.totalPayments.toLocaleString('pt-BR')}
                            </Title>
                          </div>
                          <div>
                            <Text strong>Pagamentos Pendentes</Text>
                            <Title level={4} style={{ margin: '8px 0', color: '#ff4d4f' }}>
                              R$ {financialMetrics.pendingPayments.toLocaleString('pt-BR')}
                            </Title>
                          </div>
                          <div>
                            <Text strong>Valor Médio por Pagamento</Text>
                            <Title level={4} style={{ margin: '8px 0' }}>
                              R$ {financialMetrics.averagePaymentValue.toLocaleString('pt-BR')}
                            </Title>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card title="Tendências de Pagamento" style={{ borderRadius: '12px' }}>
                        <List
                          dataSource={financialMetrics.paymentTrends}
                          renderItem={(item) => (
                            <List.Item>
                              <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <Text strong>{item.month}</Text>
                                  <Text>{item.count} pagamentos</Text>
                                </div>
                                <Progress
                                  percent={Math.round((item.amount / financialMetrics.totalRevenue) * 100)}
                                  strokeColor="#52c41a"
                                  showInfo={false}
                                />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                  R$ {item.amount.toLocaleString('pt-BR')}
                                </Text>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'process',
              label: (
                <span>
                  <FileOutlined />
                  Processos
                </span>
              ),
              children: (
                <Card title="Relatório de Processos" style={{ borderRadius: '16px' }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Card title="Distribuição por Status" style={{ borderRadius: '12px' }}>
                        <List
                          dataSource={processMetrics.statusDistribution}
                          renderItem={(item) => (
                            <List.Item>
                              <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <Text strong>{item.status}</Text>
                                  <Text>{item.count} processos</Text>
                                </div>
                                <Progress
                                  percent={item.percentage}
                                  strokeColor={
                                    item.status === 'Concluído' ? '#52c41a' :
                                    item.status === 'Em Andamento' ? '#1890ff' : '#faad14'
                                  }
                                  showInfo={false}
                                />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                  {item.percentage}% do total
                                </Text>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card title="Métricas Gerais" style={{ borderRadius: '12px' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                          <div>
                            <Text strong>Total de Processos</Text>
                            <Title level={3} style={{ margin: '8px 0', color: '#1890ff' }}>
                              {processMetrics.totalProcesses}
                            </Title>
                          </div>
                          <div>
                            <Text strong>Processos Concluídos</Text>
                            <Title level={4} style={{ margin: '8px 0', color: '#52c41a' }}>
                              {processMetrics.completedProcesses}
                            </Title>
                          </div>
                          <div>
                            <Text strong>Duração Média</Text>
                            <Title level={4} style={{ margin: '8px 0' }}>
                              {processMetrics.averageProcessDuration} dias
                            </Title>
                          </div>
                          <div>
                            <Text strong>Taxa de Conclusão</Text>
                            <Title level={4} style={{ margin: '8px 0', color: '#52c41a' }}>
                              {Math.round((processMetrics.completedProcesses / processMetrics.totalProcesses) * 100)}%
                            </Title>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'history',
              label: (
                <span>
                  <ClockCircleOutlined />
                  Histórico
                </span>
              ),
              children: (
                <Card title="Histórico de Relatórios" style={{ borderRadius: '16px' }}>
                  <Table
                    dataSource={reportsData}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: 'Título',
                        dataIndex: 'title',
                        key: 'title',
                        render: (text, record) => (
                          <Space>
                            <FileOutlined style={{ color: '#1890ff' }} />
                            <Text strong>{text}</Text>
                          </Space>
                        )
                      },
                      {
                        title: 'Tipo',
                        dataIndex: 'type',
                        key: 'type',
                        render: (type) => {
                          const colors = {
                            productivity: 'blue',
                            financial: 'green',
                            process: 'purple',
                            user: 'orange'
                          }
                          return <Tag color={colors[type]}>{type}</Tag>
                        }
                      },
                      {
                        title: 'Período',
                        dataIndex: 'period',
                        key: 'period'
                      },
                      {
                        title: 'Gerado por',
                        dataIndex: 'generatedBy',
                        key: 'generatedBy'
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          const colors = {
                            completed: 'green',
                            processing: 'blue',
                            failed: 'red'
                          }
                          return <Tag color={colors[status]}>{status}</Tag>
                        }
                      },
                      {
                        title: 'Ações',
                        key: 'actions',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" icon={<EyeOutlined />}>
                              Visualizar
                            </Button>
                            <Button size="small" icon={<DownloadOutlined />}>
                              Download
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </Card>
              )
            }
          ]}
        />
      </Card>

      {/* Modal de Exportação */}
      <Modal
        title="Exportar Relatório"
        open={isExportModalVisible}
        onCancel={() => setIsExportModalVisible(false)}
        footer={null}
        style={{ borderRadius: '16px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Informações sobre os dados a serem exportados */}
          {lastReportGenerated && (
            <Card 
              size="small" 
              style={{ 
                background: '#f0f9ff', 
                borderColor: '#1890ff',
                marginBottom: '16px'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: '#1890ff' }}>
                  📊 Dados do Relatório
                </Text>
                <div style={{ fontSize: '12px' }}>
                  <div>📅 Gerado em: {lastReportGenerated.toLocaleString('pt-BR')}</div>
                  <div>📋 Tipo: {selectedReportType === 'all' ? 'Todos' : selectedReportType}</div>
                  {dateRange && (
                    <div>
                      📆 Período: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
                    </div>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ✅ {realProcesses.length} processos • {realTasks.length} tarefas
                  </div>
                  {realDashboardStats && (
                    <div style={{ color: '#52c41a' }}>
                      ✅ Estatísticas do Dashboard incluídas
                    </div>
                  )}
                </div>
              </Space>
            </Card>
          )}
          
          <div>
            <Text strong>Escolha o formato de exportação:</Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Button
                icon={<FilePdfOutlined />}
                onClick={() => handleExportReport('pdf')}
                style={{
                  width: '100%',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px'
                }}
              >
                PDF
              </Button>
            </Col>
            <Col span={8}>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => handleExportReport('excel')}
                style={{
                  width: '100%',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #20b2aa 0%, #1a9b94 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px'
                }}
              >
                Excel
              </Button>
            </Col>
            <Col span={8}>
              <Button
                icon={<TableOutlined />}
                onClick={() => handleExportReport('csv')}
                style={{
                  width: '100%',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6c7b95 0%, #5a6b7d 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px'
                }}
              >
                CSV
              </Button>
            </Col>
          </Row>
        </Space>
      </Modal>
    </div>
  )
}