import React, { useState, useEffect } from 'react'
import { 
  Card, Table, Button, Input, Select, DatePicker, Modal, Form, 
  Tag, Progress, Space, Typography, message, Row, Col, Badge,
  Tooltip, Popconfirm
} from 'antd'
import { 
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, ReloadOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { taskService, Task, TaskCreate, TaskUpdate } from '../services/taskService'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

export const TasksPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { user } = useAuth()

  // Carregar tarefas
  const loadTasks = async () => {
    setLoading(true)
    try {
      // Temporariamente usando dados mockados para evitar timeout
      console.log('Carregando tarefas...')
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockTasks = [
        {
          id: 1,
          title: "Elaborar petição inicial - Ação Trabalhista",
          description: "Preparar petição inicial para processo de rescisão indireta",
          status: "in_progress",
          priority: "high",
          due_date: "2024-02-15T10:00:00Z",
          progress_percentage: 75,
          estimated_hours: 8,
          actual_hours: 6,
          category: "Trabalhista",
          process_id: 1,
          assigned_user_id: 2,
          created_by_id: 1,
          created_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-20T14:30:00Z"
        },
        {
          id: 2,
          title: "Análise de documentos - Processo Criminal",
          description: "Revisar documentos e evidências do processo criminal",
          status: "completed",
          priority: "urgent",
          due_date: "2024-01-25T17:00:00Z",
          completed_at: "2024-01-24T16:30:00Z",
          progress_percentage: 100,
          estimated_hours: 4,
          actual_hours: 5,
          category: "Criminal",
          process_id: 2,
          assigned_user_id: 3,
          created_by_id: 1,
          created_at: "2024-01-20T10:00:00Z",
          updated_at: "2024-01-24T16:30:00Z"
        },
        {
          id: 3,
          title: "Cálculo de verbas rescisórias",
          description: "Calcular valores de rescisão e verbas trabalhistas",
          status: "todo",
          priority: "medium",
          due_date: "2024-02-20T12:00:00Z",
          progress_percentage: 0,
          estimated_hours: 6,
          category: "Trabalhista",
          process_id: 1,
          assigned_user_id: 3,
          created_by_id: 2,
          created_at: "2024-01-22T11:00:00Z",
          updated_at: "2024-01-22T11:00:00Z"
        },
        {
          id: 4,
          title: "Preparar defesa - Processo Civil",
          description: "Elaborar estratégia de defesa para ação de danos morais",
          status: "in_progress",
          priority: "high",
          due_date: "2024-02-10T15:00:00Z",
          progress_percentage: 40,
          estimated_hours: 12,
          actual_hours: 5,
          category: "Civil",
          process_id: 3,
          assigned_user_id: 2,
          created_by_id: 1,
          created_at: "2024-01-18T08:00:00Z",
          updated_at: "2024-01-21T16:00:00Z"
        },
        {
          id: 5,
          title: "Audiência de conciliação",
          description: "Participar da audiência de tentativa de conciliação",
          status: "review",
          priority: "urgent",
          due_date: "2024-02-05T14:00:00Z",
          progress_percentage: 90,
          estimated_hours: 3,
          actual_hours: 3,
          category: "Civil",
          process_id: 3,
          assigned_user_id: 2,
          created_by_id: 1,
          created_at: "2024-01-25T09:00:00Z",
          updated_at: "2024-01-26T10:30:00Z"
        }
      ]
      
      // Filtrar por status se necessário
      let filteredTasks = mockTasks
      if (statusFilter && statusFilter !== 'all') {
        filteredTasks = mockTasks.filter(t => t.status === statusFilter)
      }
      
      setTasks(filteredTasks)
      setTotal(filteredTasks.length)
      
      console.log('Tarefas carregadas com sucesso (mock data)')
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
      message.error('Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [currentPage, pageSize, statusFilter])

  // Funções para gerenciar tarefas
  const handleCreateTask = () => {
    setEditingTask(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    form.setFieldsValue({
      ...task,
      due_date: task.due_date ? dayjs(task.due_date) : null,
      tags: task.tags?.join(', ')
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingTask) {
        // Atualizar tarefa
        await taskService.updateTask(editingTask.id, {
          ...values,
          due_date: values.due_date?.format('YYYY-MM-DD'),
          tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : []
        })
        message.success('Tarefa atualizada com sucesso!')
      } else {
        // Criar nova tarefa
        await taskService.createTask({
          ...values,
          due_date: values.due_date?.format('YYYY-MM-DD'),
          tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : []
        })
        message.success('Tarefa criada com sucesso!')
      }
      
      setIsModalVisible(false)
      loadTasks()
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      message.error('Erro ao salvar tarefa')
    }
  }

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      message.success('Tarefa excluída com sucesso!')
      loadTasks()
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      message.error('Erro ao excluir tarefa')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pendente': 'orange',
      'Em Andamento': 'blue',
      'Concluída': 'green',
      'Cancelada': 'red',
      'Pausada': 'yellow'
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
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Task) => (
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
      title: 'Processo',
      dataIndex: 'process_number',
      key: 'process_number',
      width: 200,
      render: (number: string) => number ? (
        <Typography.Text code copyable>
          {number}
        </Typography.Text>
      ) : '-'
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
      title: 'Prazo',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date: string) => date ? (
        <Space>
          <ClockCircleOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ) : '-'
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, record: Task) => (
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
              onClick={() => handleEditTask(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir esta tarefa?"
            onConfirm={() => handleDeleteTask(record.id)}
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
              Tarefas
              <Badge count={total} style={{ marginLeft: '16px' }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadTasks}
                loading={loading}
              >
                Atualizar
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateTask}
              >
                Nova Tarefa
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
              placeholder="Buscar tarefas..."
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
              <Option value="Pendente">Pendente</Option>
              <Option value="Em Andamento">Em Andamento</Option>
              <Option value="Concluída">Concluída</Option>
              <Option value="Cancelada">Cancelada</Option>
              <Option value="Pausada">Pausada</Option>
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
        </Row>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} tarefas`,
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
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
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
            status: 'Pendente',
            priority: 'Média',
            progress: 0
          }}
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Título da tarefa" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
          >
            <Input.TextArea rows={3} placeholder="Descrição da tarefa" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Tipo"
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select placeholder="Selecione o tipo">
                  <Option value="Cálculo">Cálculo</Option>
                  <Option value="Análise">Análise</Option>
                  <Option value="Documentação">Documentação</Option>
                  <Option value="Revisão">Revisão</Option>
                  <Option value="Entrega">Entrega</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select>
                  <Option value="Pendente">Pendente</Option>
                  <Option value="Em Andamento">Em Andamento</Option>
                  <Option value="Concluída">Concluída</Option>
                  <Option value="Cancelada">Cancelada</Option>
                  <Option value="Pausada">Pausada</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={8}>
              <Form.Item
                name="estimated_hours"
                label="Horas Estimadas"
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="due_date"
            label="Data de Vencimento"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            help="Separe as tags por vírgula"
          >
            <Input placeholder="Ex: Urgente, Trabalhista, Documentação" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}