import React, { useState, useEffect } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Avatar, Statistic, Descriptions, Progress, Tabs, Badge,
  List, Divider, Alert
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ExportOutlined, EyeOutlined,
  EditOutlined, DollarOutlined, CreditCardOutlined, BankOutlined,
  CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, RiseOutlined, BarChartOutlined,
  PieChartOutlined, LineChartOutlined, ArrowUpOutlined,
  WalletOutlined, FileTextOutlined, TeamOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { financialService } from '../services/financialService'

const { Title, Text } = Typography
const { Option } = Select

interface Payment {
  id: string
  partner: string
  processNumber: string
  task: string
  amount: number
  status: string
  dueDate: string
  paidDate?: string
  paymentMethod: string
  invoice: string
}

export const FinancialPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [financialData, setFinancialData] = useState<any>(null)
  const [revenueByArea, setRevenueByArea] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [topClients, setTopClients] = useState<any[]>([])
  const [financialInsights, setFinancialInsights] = useState<any[]>([])
  
  const handleCreate = () => {
    setIsModalVisible(true)
  }
  
  const handleModalOk = () => {
    setIsModalVisible(false)
    message.success('Funcionalidade em desenvolvimento!')
  }
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [form] = Form.useForm()

  // Carregar dados financeiros avançados
  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // Carregar dados reais do sistema
      const [financialData, revenueByArea, monthlyTrends, topClients, insights] = await Promise.all([
        financialService.getFinancialData(),
        financialService.getRevenueByArea(),
        financialService.getMonthlyTrends(),
        financialService.getTopClients(),
        financialService.getFinancialInsights()
      ])

      // Converter insights para formato com ícones
      const formattedInsights = insights.map(insight => ({
        ...insight,
        icon: insight.icon === 'ArrowUpOutlined' ? <ArrowUpOutlined /> :
              insight.icon === 'ClockCircleOutlined' ? <ClockCircleOutlined /> :
              insight.icon === 'DollarOutlined' ? <DollarOutlined /> :
              insight.icon === 'ArrowDownOutlined' ? <ArrowUpOutlined /> : <DollarOutlined />
      }))

      setFinancialData(financialData)
      setRevenueByArea(revenueByArea)
      setMonthlyTrends(monthlyTrends)
      setTopClients(topClients)
      setFinancialInsights(formattedInsights)
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      message.error('Erro ao carregar dados financeiros')
      
      // Fallback para dados mockados em caso de erro
      const fallbackData = {
        totalRevenue: 0,
        monthlyRevenue: 0,
        growthRate: 0,
        averageTicket: 0,
        totalClients: 0,
        activeClients: 0,
        pendingPayments: 0,
        paidPayments: 0,
        overduePayments: 0
      }
      
      setFinancialData(fallbackData)
      setRevenueByArea([])
      setMonthlyTrends([])
      setTopClients([])
      setFinancialInsights([])
    } finally {
      setLoading(false)
    }
  }

  // Dados mockados
  const paymentsData: Payment[] = [
    {
      id: '1',
      partner: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      task: 'Cálculo de Rescisão Trabalhista',
      amount: 2500,
      status: 'Pago',
      dueDate: '2024-01-25',
      paidDate: '2024-01-23',
      paymentMethod: 'PIX',
      invoice: 'INV-001'
    },
    {
      id: '2',
      partner: 'Ana Santos',
      processNumber: '2001234-56.2024.8.26.0002',
      task: 'Análise de Documentos',
      amount: 1500,
      status: 'Pendente',
      dueDate: '2024-02-15',
      paymentMethod: 'Transferência',
      invoice: 'INV-002'
    },
    {
      id: '3',
      partner: 'Maria Costa',
      processNumber: '3001234-56.2024.8.26.0003',
      task: 'Elaboração de Parecer',
      amount: 800,
      status: 'Atrasado',
      dueDate: '2024-01-20',
      paymentMethod: 'PIX',
      invoice: 'INV-003'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'success'
      case 'Pendente': return 'warning'
      case 'Atrasado': return 'error'
      default: return 'default'
    }
  }

  const columns = [
    {
      title: 'Parceiro',
      dataIndex: 'partner',
      key: 'partner',
      width: 150,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={32} icon={<UserOutlined />} />
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Processo',
      dataIndex: 'processNumber',
      key: 'processNumber',
      width: 180,
      render: (text: string) => (
        <Text style={{ fontSize: '13px' }}>{text}</Text>
      )
    },
    {
      title: 'Tarefa',
      dataIndex: 'task',
      key: 'task',
      width: 200,
      render: (text: string) => (
        <Text style={{ fontSize: '13px' }}>{text}</Text>
      )
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ fontSize: '14px', color: '#031f5f' }}>
          R$ {amount.toLocaleString('pt-BR')}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: '8px' }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => (
        <Text style={{ fontSize: '13px' }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record: Payment) => (
        <Space size="small">
          <Tooltip title="Visualizar">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
        </Space>
      )
    }
  ]

  const filteredData = paymentsData.filter(payment => {
    const matchesSearch = payment.partner.toLowerCase().includes(searchText.toLowerCase()) ||
                         payment.processNumber.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = financialData ? [
    {
      title: 'Receita Total',
      value: financialData.totalRevenue,
      icon: <RiseOutlined />,
      color: '#52c41a',
      suffix: 'R$',
      trend: `+${financialData.growthRate}%`
    },
    {
      title: 'Receita Mensal',
      value: financialData.monthlyRevenue,
      icon: <BarChartOutlined />,
      color: '#1890ff',
      suffix: 'R$',
      trend: 'Este mês'
    },
    {
      title: 'Ticket Médio',
      value: financialData.averageTicket,
      icon: <DollarOutlined />,
      color: '#722ed1',
      suffix: 'R$',
      trend: 'Por processo'
    },
    {
      title: 'Clientes Ativos',
      value: financialData.activeClients,
      icon: <TeamOutlined />,
      color: '#faad14',
      suffix: '',
      trend: `de ${financialData.totalClients} total`
    }
  ] : []

  // Funções de renderização das abas
  const renderOverviewTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Resumo Financeiro" style={{ borderRadius: '12px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Receita Total</Text>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    R$ {financialData?.totalRevenue.toLocaleString('pt-BR')}
                  </div>
                </div>
                <Badge count={`+${financialData?.growthRate}%`} style={{ backgroundColor: '#52c41a' }} />
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary">Receita Mensal</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    R$ {financialData?.monthlyRevenue.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Ticket Médio</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    R$ {financialData?.averageTicket.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Status dos Pagamentos" style={{ borderRadius: '12px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Pagamentos Realizados</Text>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                    R$ {financialData?.paidPayments.toLocaleString('pt-BR')}
                  </div>
                </div>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Pagamentos Pendentes</Text>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#faad14' }}>
                    R$ {financialData?.pendingPayments.toLocaleString('pt-BR')}
                  </div>
                </div>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Pagamentos Atrasados</Text>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    R$ {financialData?.overduePayments.toLocaleString('pt-BR')}
                  </div>
                </div>
                <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderRevenueTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Receitas por Área Jurídica" style={{ borderRadius: '12px' }}>
            <List
              dataSource={revenueByArea}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{item.area}</Text>
                      <Text strong style={{ color: '#52c41a' }}>
                        R$ {item.revenue.toLocaleString('pt-BR')}
                      </Text>
                    </div>
                    <Progress 
                      percent={item.percentage} 
                      strokeColor="#52c41a"
                      showInfo={false}
                      style={{ marginBottom: 4 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                      <span>{item.percentage}% do total</span>
                      <span>{item.cases} processos</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Distribuição" style={{ borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }}>
                <PieChartOutlined />
              </div>
              <Text type="secondary">Gráfico de Pizza</Text>
              <div style={{ marginTop: 16 }}>
                {revenueByArea.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: ['#52c41a', '#1890ff', '#faad14', '#722ed1'][index],
                        borderRadius: '50%',
                        marginRight: 8
                      }} 
                    />
                    <Text style={{ fontSize: '12px' }}>{item.area}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderTrendsTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Tendências Mensais" style={{ borderRadius: '12px' }}>
            <Row gutter={[16, 16]}>
              {monthlyTrends.map((trend, index) => (
                <Col xs={24} sm={12} md={8} lg={4} key={index}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 8 }}>
                      {trend.month}
                    </div>
                    <div style={{ fontSize: '18px', color: '#52c41a', fontWeight: 'bold' }}>
                      R$ {trend.revenue.toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {trend.cases} processos
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderClientsTab = () => (
    <div>
      <Card title="Top Clientes por Receita" style={{ borderRadius: '12px' }}>
        <List
          dataSource={topClients}
          renderItem={(client, index) => (
            <List.Item>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count={index + 1} style={{ backgroundColor: '#52c41a', marginRight: 12 }} />
                  <Avatar size={40} icon={<UserOutlined />} style={{ marginRight: 12 }} />
                  <div>
                    <Text strong>{client.name}</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {client.cases} processos • Último pagamento: {dayjs(client.lastPayment).format('DD/MM/YYYY')}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                    R$ {client.revenue.toLocaleString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Total recebido
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  const renderPaymentsTab = () => (
    <div>
      {/* Filters and Actions */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none',
          marginBottom: '24px'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Buscar pagamentos..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: '12px' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="Pago">Pago</Option>
              <Option value="Pendente">Pendente</Option>
              <Option value="Atrasado">Atrasado</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #031f5f 0%, #00afee 100%)',
                border: 'none'
              }}
            >
              Novo Pagamento
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: 'none'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} pagamentos`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  )

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Módulo Financeiro
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Controle de receitas e pagamentos de parceiros
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
              styles={{ body: { padding: '20px' } }}
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
                      valueStyle={{ 
                        color: stat.color, 
                        fontSize: '24px', 
                        fontWeight: 700
                      }}
                    />
                  </div>
                  {stat.trend && (
                    <Text style={{ color: '#666', fontSize: '12px' }}>
                      {stat.trend}
                    </Text>
                  )}
                </div>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    background: `${stat.color}20`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
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

      {/* Financial Insights */}
      {financialInsights.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {financialInsights.map((insight, index) => (
            <Col xs={24} sm={8} key={index}>
              <Alert
                message={insight.title}
                description={insight.description}
                type={insight.type as any}
                icon={insight.icon}
                showIcon
                style={{ borderRadius: '12px' }}
                action={
                  <Text strong style={{ color: insight.type === 'success' ? '#52c41a' : insight.type === 'warning' ? '#faad14' : '#1890ff' }}>
                    {insight.value}
                  </Text>
                }
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Tabs */}
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
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  Visão Geral
                </span>
              ),
              children: renderOverviewTab()
            },
            {
              key: 'revenue',
              label: (
                <span>
                  <PieChartOutlined />
                  Receitas por Área
                </span>
              ),
              children: renderRevenueTab()
            },
            {
              key: 'trends',
              label: (
                <span>
                  <LineChartOutlined />
                  Tendências
                </span>
              ),
              children: renderTrendsTab()
            },
            {
              key: 'clients',
              label: (
                <span>
                  <TeamOutlined />
                  Top Clientes
                </span>
              ),
              children: renderClientsTab()
            },
            {
              key: 'payments',
              label: (
                <span>
                  <CreditCardOutlined />
                  Pagamentos
                </span>
              ),
              children: renderPaymentsTab()
            }
          ]}
        />
      </Card>


      {/* Modal básico */}
      <Modal
        title="Novo Pagamento"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <p>Funcionalidade em desenvolvimento...</p>
      </Modal>
    </div>
  )
}