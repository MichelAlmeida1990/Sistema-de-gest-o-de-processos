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

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs

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

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedReportType, setSelectedReportType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isExportModalVisible, setIsExportModalVisible] = useState(false)

  // Dados mockados dos relatórios
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
      title: 'Relatório de Processos - Fevereiro 2024',
      type: 'process',
      period: '2024-02-01 a 2024-02-29',
      generatedAt: '2024-02-29T19:15:00',
      generatedBy: 'Maria Costa',
      status: 'completed'
    }
  ]

  // Métricas mockadas
  const productivityMetrics: ProductivityMetrics = {
    totalTasks: 156,
    completedTasks: 134,
    averageCompletionTime: 3.2,
    overdueTasks: 8,
    userProductivity: [
      { user: 'Ana Santos', tasksCompleted: 45, averageTime: 2.8, efficiency: 95 },
      { user: 'Carlos Lima', tasksCompleted: 38, averageTime: 3.1, efficiency: 88 },
      { user: 'Maria Costa', tasksCompleted: 32, averageTime: 3.5, efficiency: 82 },
      { user: 'Roberto Silva', tasksCompleted: 19, averageTime: 4.2, efficiency: 75 }
    ]
  }

  const financialMetrics: FinancialMetrics = {
    totalRevenue: 125000,
    totalPayments: 98000,
    pendingPayments: 27000,
    averagePaymentValue: 2450,
    paymentTrends: [
      { month: 'Jan', amount: 35000, count: 14 },
      { month: 'Fev', amount: 28000, count: 11 },
      { month: 'Mar', amount: 35000, count: 15 }
    ]
  }

  const processMetrics: ProcessMetrics = {
    totalProcesses: 89,
    completedProcesses: 67,
    averageProcessDuration: 45,
    statusDistribution: [
      { status: 'Concluído', count: 67, percentage: 75.3 },
      { status: 'Em Andamento', count: 15, percentage: 16.9 },
      { status: 'Pendente', count: 7, percentage: 7.8 }
    ]
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    message.success('Relatório gerado com sucesso!')
    setLoading(false)
  }

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    message.success(`Relatório exportado em formato ${format.toUpperCase()}`)
    setIsExportModalVisible(false)
  }

  const DashboardTab = () => (
    <Row gutter={[24, 24]}>
      {/* Métricas Principais */}
      <Col span={24}>
        <Card title="Métricas Principais" style={{ borderRadius: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Total de Tarefas"
                  value={productivityMetrics.totalTasks}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Receita Total"
                  value={financialMetrics.totalRevenue}
                  prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                  formatter={(value) => `${value?.toLocaleString('pt-BR')}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Processos Ativos"
                  value={processMetrics.totalProcesses}
                  prefix={<FileOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Taxa de Conclusão"
                  value={((productivityMetrics.completedTasks / productivityMetrics.totalTasks) * 100).toFixed(1)}
                  suffix="%"
                  prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Produtividade por Usuário */}
      <Col xs={24} lg={12}>
        <Card title="Produtividade por Usuário" style={{ borderRadius: '16px' }}>
          <List
            dataSource={productivityMetrics.userProductivity}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.user}
                  description={
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>{item.tasksCompleted} tarefas concluídas</Text>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ color: '#666' }}>
                          Tempo médio: {item.averageTime} dias
                        </Text>
                      </div>
                      <div>
                        <Text style={{ color: '#666', marginRight: '8px' }}>Eficiência:</Text>
                        <Progress
                          percent={item.efficiency}
                          size="small"
                          strokeColor={item.efficiency >= 90 ? '#52c41a' : item.efficiency >= 80 ? '#faad14' : '#ff4d4f'}
                        />
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* Distribuição de Status dos Processos */}
      <Col xs={24} lg={12}>
        <Card title="Status dos Processos" style={{ borderRadius: '16px' }}>
          <List
            dataSource={processMetrics.statusDistribution}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text strong>{item.status}</Text>
                    <Text>{item.count} processos ({item.percentage}%)</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    strokeColor={
                      item.status === 'Concluído' ? '#52c41a' :
                      item.status === 'Em Andamento' ? '#1890ff' : '#faad14'
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* Tendencias de Pagamento */}
      <Col span={24}>
        <Card title="Tendências de Pagamento" style={{ borderRadius: '16px' }}>
          <Row gutter={[16, 16]}>
            {financialMetrics.paymentTrends.map((trend, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    {trend.month}
                  </Title>
                  <Statistic
                    title="Valor"
                    value={trend.amount}
                    prefix="R$"
                    valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    formatter={(value) => `${value?.toLocaleString('pt-BR')}`}
                  />
                  <Text style={{ color: '#666' }}>
                    {trend.count} pagamentos
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  )

  const ProductivityTab = () => (
    <Card title="Relatório de Produtividade" style={{ borderRadius: '16px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Table
            columns={[
              {
                title: 'Usuário',
                dataIndex: 'user',
                key: 'user',
                render: (text) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>{text}</Text>
                  </div>
                )
              },
              {
                title: 'Tarefas Concluídas',
                dataIndex: 'tasksCompleted',
                key: 'tasksCompleted',
                render: (value) => (
                  <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                    {value}
                  </Tag>
                )
              },
              {
                title: 'Tempo Médio (dias)',
                dataIndex: 'averageTime',
                key: 'averageTime',
                render: (value) => (
                  <Text>{value}</Text>
                )
              },
              {
                title: 'Eficiência',
                dataIndex: 'efficiency',
                key: 'efficiency',
                render: (value) => (
                  <Progress
                    percent={value}
                    size="small"
                    strokeColor={value >= 90 ? '#52c41a' : value >= 80 ? '#faad14' : '#ff4d4f'}
                  />
                )
              }
            ]}
            dataSource={productivityMetrics.userProductivity}
            pagination={false}
            rowKey="user"
          />
        </Col>
      </Row>
    </Card>
  )

  const FinancialTab = () => (
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
                <Title level={4} style={{ margin: '8px 0', color: '#faad14' }}>
                  R$ {financialMetrics.pendingPayments.toLocaleString('pt-BR')}
                </Title>
              </div>
              <div>
                <Text strong>Valor Médio por Pagamento</Text>
                <Title level={4} style={{ margin: '8px 0', color: '#722ed1' }}>
                  R$ {financialMetrics.averagePaymentValue.toLocaleString('pt-BR')}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Tendências Mensais" style={{ borderRadius: '12px' }}>
            <List
              dataSource={financialMetrics.paymentTrends}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong>{item.month}</Text>
                      <Text>R$ {item.amount.toLocaleString('pt-BR')}</Text>
                    </div>
                    <Progress
                      percent={(item.amount / Math.max(...financialMetrics.paymentTrends.map(t => t.amount))) * 100}
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  )

  const ProcessTab = () => (
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
                      <Tag 
                        color={
                          item.status === 'Concluído' ? 'green' :
                          item.status === 'Em Andamento' ? 'blue' : 'orange'
                        }
                      >
                        {item.status}
                      </Tag>
                      <Text strong>{item.count} ({item.percentage}%)</Text>
                    </div>
                    <Progress
                      percent={item.percentage}
                      strokeColor={
                        item.status === 'Concluído' ? '#52c41a' :
                        item.status === 'Em Andamento' ? '#1890ff' : '#faad14'
                      }
                    />
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
                <Title level={4} style={{ margin: '8px 0', color: '#722ed1' }}>
                  {processMetrics.averageProcessDuration} dias
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  )

  const reportColumns = [
    {
      title: 'Relatório',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ReportData) => (
        <div>
          <Text strong>{text}</Text>
          <div style={{ marginTop: '4px' }}>
            <Tag color="blue">{record.type}</Tag>
            <Text style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
              {record.period}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Gerado por',
      dataIndex: 'generatedBy',
      key: 'generatedBy',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={24} icon={<UserOutlined />} />
          <Text>{text}</Text>
        </div>
      )
    },
    {
      title: 'Data',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'processing' ? 'blue' : 'red'}>
          {status === 'completed' ? 'Concluído' : status === 'processing' ? 'Processando' : 'Falhou'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record: ReportData) => (
        <Space>
          <Tooltip title="Visualizar">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Baixar PDF">
            <Button type="text" icon={<FilePdfOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Exportar Excel">
            <Button type="text" icon={<FileExcelOutlined />} size="small" />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Relatórios e Análises
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Dashboards executivos e relatórios detalhados do sistema
        </Text>
      </div>

      {/* Filtros e Ações */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none',
          marginBottom: '24px'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text strong>Período:</Text>
            <RangePicker
              style={{ width: '100%', borderRadius: '12px' }}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text strong>Tipo de Relatório:</Text>
            <Select
              placeholder="Todos"
              value={selectedReportType}
              onChange={setSelectedReportType}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="productivity">Produtividade</Option>
              <Option value="financial">Financeiro</Option>
              <Option value="process">Processos</Option>
              <Option value="user">Usuários</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Text strong>Usuários:</Text>
            <Select
              mode="multiple"
              placeholder="Selecionar usuários"
              value={selectedUsers}
              onChange={setSelectedUsers}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="Ana Santos">Ana Santos</Option>
              <Option value="Carlos Lima">Carlos Lima</Option>
              <Option value="Maria Costa">Maria Costa</Option>
              <Option value="Roberto Silva">Roberto Silva</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Space>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={handleGenerateReport}
                loading={loading}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                  border: 'none'
                }}
              >
                Gerar Relatório
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => setIsExportModalVisible(true)}
                style={{ borderRadius: '12px' }}
              >
                Exportar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs de Relatórios */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
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
              children: <DashboardTab />
            },
            {
              key: 'productivity',
              label: (
                <span>
                  <UserOutlined />
                  Produtividade
                </span>
              ),
              children: <ProductivityTab />
            },
            {
              key: 'financial',
              label: (
                <span>
                  <DollarOutlined />
                  Financeiro
                </span>
              ),
              children: <FinancialTab />
            },
            {
              key: 'process',
              label: (
                <span>
                  <FileOutlined />
                  Processos
                </span>
              ),
              children: <ProcessTab />
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
                <Table
                  columns={reportColumns}
                  dataSource={reportsData}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} de ${total} relatórios`
                  }}
                />
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
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => handleExportReport('pdf')}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              border: 'none'
            }}
          >
            Exportar como PDF
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => handleExportReport('excel')}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px'
            }}
          >
            Exportar como Excel
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExportReport('csv')}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px'
            }}
          >
            Exportar como CSV
          </Button>
        </Space>
      </Modal>
    </div>
  )
}
