import React, { useState, useEffect } from 'react'
import { 
  Card, Table, Button, Input, Select, DatePicker, Modal, Form, 
  Tag, Progress, Space, Typography, message, Row, Col, Badge,
  Tooltip, Popconfirm
} from 'antd'
import { 
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, FilterOutlined, ReloadOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { processService, Process, ProcessCreate, ProcessUpdate } from '../services/processService'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

export const ProcessesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateRange, setDateRange] = useState<any>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [form] = Form.useForm()
  const [processes, setProcesses] = useState<Process[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { user, isLoading: authLoading } = useAuth()

  // Carregar processos
  const loadProcesses = async () => {
    // Não carregar se ainda estiver validando autenticação
    if (authLoading) {
      console.log('⏳ Aguardando validação de autenticação...')
      return
    }
    
    // Não carregar se não houver usuário autenticado
    if (!user) {
      console.log('❌ Usuário não autenticado. Aguardando login...')
      return
    }
    
    setLoading(true)
    try {
      console.log('Carregando processos...')
      
      // Verificar token antes de fazer a requisição
      const token = localStorage.getItem('token')
      console.log('🔍 Token antes da requisição:', token ? token.substring(0, 20) + '...' : 'NÃO ENCONTRADO')
      
      if (!token || token === 'undefined' || token === 'null') {
        console.log('❌ Token não encontrado ou inválido')
        message.warning('Token não encontrado. Verificando autenticação...')
        // Não redirecionar imediatamente - deixar o useAuth tratar
        return
      }
      
      // Usar dados reais da API
      const response = await processService.getProcesses(
        undefined, // filters
        currentPage,
        pageSize
      )
      
      // A resposta pode vir diretamente ou dentro de um objeto 'data'
      const processesList = response.processes || response.data?.processes || []
      const totalCount = response.total || response.data?.total || 0
      
      setProcesses(processesList)
      setTotal(totalCount)
      
      console.log('✅ Processos carregados com sucesso (dados reais)')
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar processos:', error)
      
      if (error.response?.status === 401) {
        console.log('🚫 Erro 401 detectado na página de processos')
        console.log('🔍 Detalhes do erro:', error.response?.data)
        
        // Verificar se o token ainda existe e é válido
        const token = localStorage.getItem('token')
        if (!token || token === 'undefined' || token === 'null') {
          console.log('⚠️ Token não encontrado após erro 401')
          message.warning('Sessão expirada. Redirecionando para login...')
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        } else {
          // Token existe mas foi rejeitado - pode ser expirado
          console.log('⚠️ Token rejeitado pelo servidor - pode estar expirado')
          message.warning('Token inválido. Verificando autenticação...')
          // Não redirecionar imediatamente - deixar o useAuth tentar validar
        }
      } else {
        message.error('Erro ao carregar processos. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Carregar processos quando o usuário estiver autenticado
  useEffect(() => {
    // Aguardar validação de autenticação terminar
    if (authLoading) {
      console.log('⏳ Aguardando validação de autenticação...')
      return
    }
    
    // Carregar processos apenas se o usuário estiver autenticado
    if (user) {
      loadProcesses()
    } else {
      console.log('❌ Usuário não autenticado. Não carregando processos.')
    }
  }, [user, authLoading, currentPage, pageSize, searchText])

  // Funções para gerenciar processos
  const handleCreateProcess = () => {
    setEditingProcess(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process)
    form.setFieldsValue({
      ...process,
      due_date: process.due_date ? dayjs(process.due_date) : null
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingProcess) {
        // Atualizar processo
        await processService.updateProcess(editingProcess.id, {
          ...values,
          due_date: values.due_date?.format('YYYY-MM-DD')
        })
        message.success('Processo atualizado com sucesso!')
      } else {
        // Criar novo processo
        await processService.createProcess({
          ...values,
          due_date: values.due_date?.format('YYYY-MM-DD')
        })
        message.success('Processo criado com sucesso!')
      }
      
      setIsModalVisible(false)
      loadProcesses()
    } catch (error) {
      console.error('Erro ao salvar processo:', error)
      message.error('Erro ao salvar processo')
    }
  }

  const handleDeleteProcess = async (id: number) => {
    try {
      await processService.deleteProcess(id)
      message.success('Processo excluído com sucesso!')
      loadProcesses()
    } catch (error) {
      console.error('Erro ao excluir processo:', error)
      message.error('Erro ao excluir processo')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Em Andamento': 'blue',
      'Concluído': 'green',
      'Pendente': 'orange',
      'Cancelado': 'red',
      'Aguardando': 'yellow'
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Alta': 'red',
      'Média': 'orange',
      'Baixa': 'green'
    }
    return colors[priority] || 'default'
  }

  const columns = [
    {
      title: 'Número',
      dataIndex: 'number',
      key: 'number',
      width: 200,
      render: (text: string) => (
        <Typography.Text code copyable>
          {text}
        </Typography.Text>
      )
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Process) => (
        <Tooltip title={text}>
          <Typography.Text strong>
            {text}
          </Typography.Text>
        </Tooltip>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
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
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      )
    },
    {
      title: 'Responsável',
      dataIndex: 'assignee_name',
      key: 'assignee_name',
      width: 150,
      render: (name: string) => name || '-'
    },
    {
      title: 'Progresso',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Cliente',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 150,
      render: (name: string) => name || '-'
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: number) => value ? `R$ ${value.toLocaleString()}` : '-'
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, record: Process) => (
        <Space>
          <Tooltip title="Visualizar">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditProcess(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este processo?"
            onConfirm={() => handleDeleteProcess(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Processos
              <Badge count={total} style={{ marginLeft: '16px' }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button 
                size="small"
                onClick={async () => {
                  const token = localStorage.getItem('token')
                  console.log('🔍 Token atual:', token)
                  if (!token || token === 'undefined') {
                    message.error('Token não encontrado! Faça login novamente.')
                    window.location.href = '/login'
                  } else {
                    console.log('🔑 Token:', token.substring(0, 30) + '...')
                    
                    // Testar se o token funciona fazendo uma requisição
                    try {
                      const response = await fetch('http://localhost:8000/api/v1/processes/', {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      })
                      
                      console.log('🧪 Teste de token - Status:', response.status)
                      
                      if (response.ok) {
                        message.success('Token válido e funcionando!')
                      } else {
                        message.error(`Token rejeitado pelo servidor: ${response.status}`)
                        console.log('❌ Resposta do servidor:', await response.text())
                      }
                    } catch (error) {
                      message.error('Erro ao testar token')
                      console.error('❌ Erro no teste:', error)
                    }
                  }
                }}
                style={{ fontSize: '11px' }}
              >
                🧪 Testar Token
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadProcesses}
                loading={loading}
              >
                Atualizar
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateProcess}
              >
                Novo Processo
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Buscar processos..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Todos os Status</Option>
              <Option value="Em Andamento">Em Andamento</Option>
              <Option value="Concluído">Concluído</Option>
              <Option value="Pendente">Pendente</Option>
              <Option value="Aguardando">Aguardando</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Prioridade"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Todas as Prioridades</Option>
              <Option value="Alta">Alta</Option>
              <Option value="Média">Média</Option>
              <Option value="Baixa">Baixa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Data Inicial', 'Data Final']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          dataSource={processes}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} processos`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size || 10)
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal
        title={editingProcess ? 'Editar Processo' : 'Novo Processo'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'Em Andamento',
            priority: 'Média',
            progress: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="number"
                label="Número do Processo"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Input placeholder="Ex: 1001234-56.2024.8.26.0001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Tipo"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="Trabalhista">Trabalhista</Option>
                  <Option value="Cível">Cível</Option>
                  <Option value="Família">Família</Option>
                  <Option value="Criminal">Criminal</Option>
                  <Option value="Previdenciário">Previdenciário</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Título do processo" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
          >
            <Input.TextArea rows={3} placeholder="Descrição do processo" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select>
                  <Option value="Em Andamento">Em Andamento</Option>
                  <Option value="Concluído">Concluído</Option>
                  <Option value="Pendente">Pendente</Option>
                  <Option value="Aguardando">Aguardando</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Prioridade"
              >
                <Select>
                  <Option value="Alta">Alta</Option>
                  <Option value="Média">Média</Option>
                  <Option value="Baixa">Baixa</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="progress"
                label="Progresso (%)"
              >
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="client_name"
                label="Cliente"
              >
                <Input placeholder="Nome do cliente" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Valor (R$)"
              >
                <Input type="number" placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="due_date"
            label="Data de Vencimento"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}