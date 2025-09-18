import React, { useState } from 'react'
import { 
  Row, Col, Card, Table, Button, Input, Select, DatePicker, 
  Tag, Space, Typography, Modal, Form, message, Tooltip,
  Badge, Avatar, Progress, Statistic, Steps
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined, CheckSquareOutlined,
  CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, PaperClipOutlined, MessageOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { createTaskEvent } from '../store/timelineStore'
import { useAuthStore } from '../store/authStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

interface Task {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  assignee: string
  processNumber: string
  createdDate: string
  dueDate: string
  progress: number
  estimatedHours: number
  actualHours: number
  attachments: number
  comments: number
  tags: string[]
}

export const TasksPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form] = Form.useForm()
  
  // Usar o store de autenticação para obter o usuário atual
  const { user } = useAuthStore()

  // Estado para as tarefas
  const [tasksData, setTasksData] = useState<Task[]>([
    {
      id: '1',
      title: 'Cálculo de Rescisão Trabalhista',
      description: 'Calcular valores de rescisão incluindo salários, férias, 13º e FGTS',
      type: 'Cálculo',
      status: 'Em Andamento',
      priority: 'Alta',
      assignee: 'Carlos Lima',
      processNumber: '1001234-56.2024.8.26.0001',
      createdDate: '2024-01-15',
      dueDate: '2024-01-25',
      progress: 75,
      estimatedHours: 8,
      actualHours: 6,
      attachments: 3,
      comments: 5,
      tags: ['Urgente', 'Trabalhista']
    },
    {
      id: '2',
      title: 'Análise de Documentos',
      description: 'Analisar documentos enviados pelo cliente',
      type: 'Análise',
      status: 'Concluído',
      priority: 'Média',
      assignee: 'Ana Santos',
      processNumber: '2001234-56.2024.8.26.0002',
      createdDate: '2024-01-10',
      dueDate: '2024-01-20',
      progress: 100,
      estimatedHours: 4,
      actualHours: 4,
      attachments: 7,
      comments: 2,
      tags: ['Documentação']
    }
  ])

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
      dueDate: dayjs(task.dueDate),
      createdDate: dayjs(task.createdDate)
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingTask) {
        // Atualizar tarefa existente
        setTasksData(prevTasks => 
          prevTasks.map(task => 
            task.id === editingTask.id 
              ? {
                  ...task,
                  ...values,
                  dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : task.dueDate,
                  createdDate: values.createdDate ? values.createdDate.format('YYYY-MM-DD') : task.createdDate,
                  id: task.id
                }
              : task
          )
        )
        
        // Criar evento de atualização na timeline
        createTaskEvent(
          'status_changed',
          values.processNumber,
          user?.name || 'Usuário',
          {
            taskTitle: values.title,
            oldStatus: editingTask.status,
            newStatus: values.status,
            assignee: values.assignee
          }
        )
        
        message.success('Tarefa atualizada com sucesso!')
      } else {
        // Criar nova tarefa
        const newTask: Task = {
          id: Date.now().toString(),
          ...values,
          dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
          createdDate: values.createdDate ? values.createdDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          progress: values.status === 'Concluído' ? 100 : (values.status === 'Em Andamento' ? 50 : 0),
          estimatedHours: values.estimatedHours || 0,
          actualHours: 0,
          attachments: 0,
          comments: 0
        }
        
        setTasksData(prevTasks => [...prevTasks, newTask])
        
        // Criar evento automático na timeline
        createTaskEvent(
          'created',
          values.processNumber,
          user?.name || 'Usuário',
          {
            taskTitle: values.title,
            assignee: values.assignee,
            priority: values.priority,
            status: values.status,
            type: values.type
          }
        )
        
        message.success('Tarefa criada com sucesso!')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      setEditingTask(null)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      message.error('Erro ao salvar tarefa')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'success'
      case 'Em Andamento': return 'processing'
      case 'Pendente': return 'warning'
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

  const columns = [
    {
      title: 'Tarefa',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string, record: Task) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <div style={{ marginTop: '4px' }}>
            {record.tags.map(tag => (
              <Tag key={tag} size="small" style={{ margin: '1px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
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
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor={{
            '0%': '#031f5f',
            '100%': '#00afee',
          }}
        />
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
      render: (_, record: Task) => (
        <Space size="small">
          <Tooltip title="Ver detalhes">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
        </Space>
      )
    }
  ]

  const filteredData = tasksData.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      title: 'Total de Tarefas',
      value: tasksData.length,
      icon: <CheckSquareOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Em Andamento',
      value: tasksData.filter(t => t.status === 'Em Andamento').length,
      icon: <ClockCircleOutlined />,
      color: '#faad14'
    },
    {
      title: 'Concluídas',
      value: tasksData.filter(t => t.status === 'Concluído').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Vencidas',
      value: tasksData.filter(t => dayjs(t.dueDate).isBefore(dayjs())).length,
      icon: <ExclamationCircleOutlined />,
      color: '#ff4d4f'
    }
  ]

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#031f5f' }}>
          Gestão de Tarefas
        </Title>
        <Text style={{ color: '#666', fontSize: '16px' }}>
          Controle e acompanhamento de todas as tarefas de cálculo
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
              placeholder="Buscar tarefas..."
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
              Nova Tarefa
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
              `${range[0]}-${range[1]} de ${total} tarefas`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  )
}