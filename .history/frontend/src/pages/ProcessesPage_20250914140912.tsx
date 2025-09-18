import React, { useState } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Badge, Avatar, Progress, Statistic, Divider
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FilterOutlined, ExportOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined,
  CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { createProcessEvent } from '../store/timelineStore'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

interface Process {
  id: string
  number: string
  title: string
  type: string
  status: string
  priority: string
  assignee: string
  createdDate: string
  dueDate: string
  progress: number
  client: string
  value: number
}

export const ProcessesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateRange, setDateRange] = useState<any>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [form] = Form.useForm()

  // Dados mockados para demonstração
  const processesData: Process[] = [
    {
      id: '1',
      number: '1001234-56.2024.8.26.0001',
      title: 'Ação Trabalhista - Rescisão Indireta',
      type: 'Trabalhista',
      status: 'Em Andamento',
      priority: 'Alta',
      assignee: 'Carlos Lima',
      createdDate: '2024-01-15',
      dueDate: '2024-02-15',
      progress: 75,
      client: 'João Silva',
      value: 25000
    },
    {
      id: '2',
      number: '2001234-56.2024.8.26.0002',
      title: 'Ação de Cobrança - Contrato',
      type: 'Cível',
      status: 'Concluído',
      priority: 'Média',
      assignee: 'Ana Santos',
      createdDate: '2024-01-10',
      dueDate: '2024-01-25',
      progress: 100,
      client: 'Empresa XYZ Ltda',
      value: 15000
    },
    {
      id: '3',
      number: '3001234-56.2024.8.26.0003',
      title: 'Ação de Família - Divórcio',
      type: 'Família',
      status: 'Pendente',
      priority: 'Baixa',
      assignee: 'Maria Costa',
      createdDate: '2024-01-20',
      dueDate: '2024-03-20',
      progress: 25,
      client: 'Pedro e Maria',
      value: 8000
    },
    {
      id: '4',
      number: '4001234-56.2024.8.26.0004',
      title: 'Ação Criminal - Furto',
      type: 'Criminal',
      status: 'Em Análise',
      priority: 'Alta',
      assignee: 'Roberto Silva',
      createdDate: '2024-01-18',
      dueDate: '2024-02-18',
      progress: 45,
      client: 'Vítima - José',
      value: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'success'
      case 'Em Andamento': return 'processing'
      case 'Pendente': return 'warning'
      case 'Em Análise': return 'default'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'error'
      case 'Média': return 'warning'
      case 'Baixa': return 'default'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Trabalhista': return <CheckCircleOutlined style={{ color: '#1890ff' }} />
      case 'Cível': return <FileTextOutlined style={{ color: '#52c41a' }} />
      case 'Família': return <UserOutlined style={{ color: '#722ed1' }} />
      case 'Criminal': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      default: return <InfoCircleOutlined style={{ color: '#666' }} />
    }
  }

  const columns = [
    {
      title: 'Número do Processo',
      dataIndex: 'number',
      key: 'number',
      width: 200,
      render: (text: string, record: Process) => (
        <div>
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
          <div style={{ marginTop: '4px' }}>
            {getTypeIcon(record.type)}
            <Text style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
              {record.type}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string) => (
        <Text style={{ fontSize: '14px' }}>{text}</Text>
      )
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      width: 150,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={24} icon={<UserOutlined />} />
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: '8px', fontWeight: 500 }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)} style={{ borderRadius: '8px', fontWeight: 500 }}>
          {priority}
        </Tag>
      )
    },
    {
      title: 'Responsável',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={24} icon={<UserOutlined />} />
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Progresso',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <div>
          <Progress 
            percent={progress} 
            size="small" 
            strokeColor={{
              '0%': '#031f5f',
              '100%': '#00afee',
            }}
            style={{ marginBottom: '4px' }}
          />
          <Text style={{ fontSize: '12px', color: '#666' }}>{progress}%</Text>
        </div>
      )
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs())
        return (
          <div>
            <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : '#666', marginRight: '4px' }} />
            <Text style={{ 
              fontSize: '13px', 
              color: isOverdue ? '#ff4d4f' : '#666' 
            }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </Text>
          </div>
        )
      }
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      render: (value: number) => (
        <Text style={{ fontSize: '13px', fontWeight: 500 }}>
          {value > 0 ? `R$ ${value.toLocaleString('pt-BR')}` : '-'}
        </Text>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_, record: Process) => (
        <Space size="small">
          <Tooltip title="Visualizar">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleEdit = (process: Process) => {
    setEditingProcess(process)
    form.setFieldsValue(process)
    setIsModalVisible(true)
  }

  const handleCreate = () => {
    setEditingProcess(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingProcess) {
        message.success('Processo atualizado com sucesso!')
      } else {
        message.success('Processo criado com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Erro ao salvar processo')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = processesData.filter(process => {
    const matchesSearch = process.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         process.number.toLowerCase().includes(searchText.toLowerCase()) ||
                         process.client.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || process.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = [
    {
      title: 'Total de Processos',
      value: processesData.length,
      icon: <FileTextOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Em Andamento',
      value: processesData.filter(p => p.status === 'Em Andamento').length,
      icon: <ClockCircleOutlined />,
      color: '#faad14'
    },
    {
      title: 'Concluídos',
      value: processesData.filter(p => p.status === 'Concluído').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Vencidos',
      value: processesData.filter(p => dayjs(p.dueDate).isBefore(dayjs())).length,
      icon: <ExclamationCircleOutlined />,
      color: '#ff4d4f'
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Gestão de Processos
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Gerencie todos os processos jurídicos do sistema
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
              placeholder="Buscar processos..."
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
              <Option value="Pendente">Pendente</Option>
              <Option value="Em Andamento">Em Andamento</Option>
              <Option value="Concluído">Concluído</Option>
              <Option value="Em Análise">Em Análise</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Prioridade"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todas</Option>
              <Option value="Alta">Alta</Option>
              <Option value="Média">Média</Option>
              <Option value="Baixa">Baixa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%', borderRadius: '12px' }}
              placeholder={['Data início', 'Data fim']}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
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
                Novo Processo
              </Button>
              <Button
                icon={<ExportOutlined />}
                style={{ borderRadius: '12px' }}
              >
                Exportar
              </Button>
              <Button
                icon={<ReloadOutlined />}
                style={{ borderRadius: '12px' }}
              >
                Atualizar
              </Button>
            </Space>
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
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} processos`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Modal para criar/editar processo */}
      <Modal
        title={editingProcess ? 'Editar Processo' : 'Novo Processo'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Número do Processo"
                name="number"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Ex: 1001234-56.2024.8.26.0001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tipo"
                name="type"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="Trabalhista">Trabalhista</Option>
                  <Option value="Cível">Cível</Option>
                  <Option value="Família">Família</Option>
                  <Option value="Criminal">Criminal</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Descrição do processo" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cliente"
                name="client"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Nome do cliente" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Responsável"
                name="assignee"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o responsável">
                  <Option value="Carlos Lima">Carlos Lima</Option>
                  <Option value="Ana Santos">Ana Santos</Option>
                  <Option value="Maria Costa">Maria Costa</Option>
                  <Option value="Roberto Silva">Roberto Silva</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Status">
                  <Option value="Pendente">Pendente</Option>
                  <Option value="Em Andamento">Em Andamento</Option>
                  <Option value="Concluído">Concluído</Option>
                  <Option value="Em Análise">Em Análise</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Prioridade"
                name="priority"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Prioridade">
                  <Option value="Alta">Alta</Option>
                  <Option value="Média">Média</Option>
                  <Option value="Baixa">Baixa</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Valor"
                name="value"
              >
                <Input placeholder="0,00" type="number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Data de Criação"
                name="createdDate"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Data de Vencimento"
                name="dueDate"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}