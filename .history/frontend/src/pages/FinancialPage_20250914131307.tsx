import React, { useState } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Avatar, Statistic, Descriptions, Progress
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ExportOutlined, EyeOutlined,
  EditOutlined, DollarOutlined, CreditCardOutlined, BankOutlined,
  CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, TrendingUpOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

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
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [form] = Form.useForm()

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

  const stats = [
    {
      title: 'Receita Total',
      value: 125430,
      icon: <TrendingUpOutlined />,
      color: '#52c41a',
      suffix: 'R$'
    },
    {
      title: 'Pagamentos Pendentes',
      value: 2300,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      suffix: 'R$'
    },
    {
      title: 'Pagamentos Realizados',
      value: 2500,
      icon: <CheckCircleOutlined />,
      color: '#1890ff',
      suffix: 'R$'
    },
    {
      title: 'Total de Parceiros',
      value: 12,
      icon: <UserOutlined />,
      color: '#722ed1',
      suffix: ''
    }
  ]

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
              bodyStyle={{ padding: '20px' }}
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
        bodyStyle={{ padding: '24px' }}
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
}