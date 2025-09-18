import React, { useState } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Badge, Avatar, Progress, Statistic, Upload, List
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, UploadOutlined, FilePdfOutlined,
  CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, InboxOutlined, SendOutlined, FileTextOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Dragger } = Upload

interface Delivery {
  id: string
  title: string
  description: string
  type: string
  status: string
  assignee: string
  processNumber: string
  processTitle: string
  createdDate: string
  deliveredDate?: string
  dueDate: string
  files: number
  fileSize: string
  client: string
  value: number
}

export const DeliveriesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)
  const [form] = Form.useForm()

  // Dados mockados
  const deliveriesData: Delivery[] = [
    {
      id: '1',
      title: 'Cálculo de Rescisão - João Silva',
      description: 'Documento com todos os cálculos de rescisão trabalhista',
      type: 'PDF',
      status: 'Entregue',
      assignee: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      processTitle: 'Ação Trabalhista - Rescisão Indireta',
      createdDate: '2024-01-15',
      deliveredDate: '2024-01-22',
      dueDate: '2024-01-25',
      files: 1,
      fileSize: '2.5 MB',
      client: 'João Silva',
      value: 2500
    },
    {
      id: '2',
      title: 'Parecer Técnico - Contrato',
      description: 'Análise jurídica do contrato em questão',
      type: 'PDF',
      status: 'Pendente',
      assignee: 'Ana Santos',
      processNumber: '2001234-56.2024.8.26.0002',
      processTitle: 'Ação de Cobrança - Contrato',
      createdDate: '2024-01-10',
      dueDate: '2024-01-30',
      files: 0,
      fileSize: '0 MB',
      client: 'Empresa XYZ Ltda',
      value: 1500
    },
    {
      id: '3',
      title: 'Relatório de Análise',
      description: 'Relatório completo da análise de documentos',
      type: 'DOCX',
      status: 'Em Preparação',
      assignee: 'Maria Costa',
      processNumber: '3001234-56.2024.8.26.0003',
      processTitle: 'Ação de Família - Divórcio',
      createdDate: '2024-01-20',
      dueDate: '2024-02-20',
      files: 2,
      fileSize: '1.8 MB',
      client: 'Pedro e Maria',
      value: 800
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return 'success'
      case 'Em Preparação': return 'processing'
      case 'Pendente': return 'warning'
      case 'Atrasado': return 'error'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
      case 'DOCX': return <FileTextOutlined style={{ color: '#1890ff' }} />
      default: return <FileTextOutlined style={{ color: '#666' }} />
    }
  }

  const columns = [
    {
      title: 'Entrega',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string, record: Delivery) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {getTypeIcon(record.type)}
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          </div>
          <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
            {record.processNumber}
          </Text>
          <Text style={{ fontSize: '11px', color: '#999' }}>
            {record.description}
          </Text>
        </div>
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
      title: 'Arquivos',
      key: 'files',
      width: 100,
      render: (_, record: Delivery) => (
        <div style={{ textAlign: 'center' }}>
          <Badge count={record.files} size="small">
            <FilePdfOutlined style={{ fontSize: '16px', color: '#666' }} />
          </Badge>
          <div style={{ marginTop: '4px' }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>
              {record.fileSize}
            </Text>
          </div>
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
          R$ {value.toLocaleString('pt-BR')}
        </Text>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_, record: Delivery) => (
        <Space size="small">
          <Tooltip title="Visualizar">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              style={{ borderRadius: '8px' }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
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
        </Space>
      )
    }
  ]

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery)
    form.setFieldsValue(delivery)
    setIsModalVisible(true)
  }

  const handleCreate = () => {
    setEditingDelivery(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingDelivery) {
        message.success('Entrega atualizada com sucesso!')
      } else {
        message.success('Entrega criada com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Erro ao salvar entrega')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = deliveriesData.filter(delivery => {
    const matchesSearch = delivery.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.processNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.client.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
    const matchesType = typeFilter === 'all' || delivery.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = [
    {
      title: 'Total de Entregas',
      value: deliveriesData.length,
      icon: <InboxOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Entregues',
      value: deliveriesData.filter(d => d.status === 'Entregue').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Pendentes',
      value: deliveriesData.filter(d => d.status === 'Pendente').length,
      icon: <ClockCircleOutlined />,
      color: '#faad14'
    },
    {
      title: 'Atrasadas',
      value: deliveriesData.filter(d => dayjs(d.dueDate).isBefore(dayjs())).length,
      icon: <ExclamationCircleOutlined />,
      color: '#ff4d4f'
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Gestão de Entregas
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Controle de entregas de cálculos e documentos
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
              placeholder="Buscar entregas..."
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
              <Option value="Em Preparação">Em Preparação</Option>
              <Option value="Entregue">Entregue</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Tipo"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="all">Todos</Option>
              <Option value="PDF">PDF</Option>
              <Option value="DOCX">DOCX</Option>
            </Select>
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
                Nova Entrega
              </Button>
              <Button
                icon={<UploadOutlined />}
                style={{ borderRadius: '12px' }}
              >
                Upload
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
              `${range[0]}-${range[1]} de ${total} entregas`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Modal para criar/editar entrega */}
      <Modal
        title={editingDelivery ? 'Editar Entrega' : 'Nova Entrega'}
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
          <Form.Item
            label="Título da Entrega"
            name="title"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Cálculo de Rescisão - João Silva" />
          </Form.Item>
          
          <Form.Item
            label="Descrição"
            name="description"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input.TextArea rows={3} placeholder="Descreva o conteúdo da entrega..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Processo Relacionado"
                name="processNumber"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o processo">
                  <Option value="1001234-56.2024.8.26.0001">1001234-56.2024.8.26.0001</Option>
                  <Option value="2001234-56.2024.8.26.0002">2001234-56.2024.8.26.0002</Option>
                  <Option value="3001234-56.2024.8.26.0003">3001234-56.2024.8.26.0003</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tipo de Arquivo"
                name="type"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="PDF">PDF</Option>
                  <Option value="DOCX">DOCX</Option>
                  <Option value="XLSX">XLSX</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                label="Cliente"
                name="client"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Nome do cliente" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Data de Vencimento"
                name="dueDate"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Valor"
                name="value"
              >
                <Input placeholder="0,00" type="number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="Upload de Arquivos">
            <Dragger
              name="files"
              multiple
              action="/api/upload"
              style={{ borderRadius: '12px' }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: '48px', color: '#031f5f' }} />
              </p>
              <p className="ant-upload-text">
                Clique ou arraste arquivos para esta área para fazer upload
              </p>
              <p className="ant-upload-hint">
                Suporte para PDF, DOCX, XLSX. Tamanho máximo: 10MB
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}